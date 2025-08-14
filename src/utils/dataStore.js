import { parseCSVContent } from "./csvParser";
import { simpleHash } from "./simpleHash";

const KEY = "ivr_data_v2";

function checkForOverlaps(newEntry, existingFiles) {
  const overlaps = [];
  const newDateRange = newEntry.dateRange || { from: newEntry.date, to: newEntry.date };
  
  if (!newDateRange.from || !newDateRange.to) {
    return { overlaps: [], conflicts: [] };
  }
  
  for (const existing of existingFiles) {
    if (existing.id === newEntry.id) continue; // Skip self
    
    const existingRange = existing.dateRange || { from: existing.date, to: existing.date };
    if (!existingRange.from || !existingRange.to) continue;
    
    // Check for date overlap
    const hasOverlap = newDateRange.from <= existingRange.to && newDateRange.to >= existingRange.from;
    
    if (hasOverlap) {
      overlaps.push({
        file: existing,
        overlapType: getOverlapType(newDateRange, existingRange),
        existingRange,
        newRange: newDateRange
      });
    }
  }
  
  // Check for potential data conflicts within overlaps
  const conflicts = overlaps.filter(overlap => {
    // If files have different agents/queues in the same time period, it's a conflict
    const newAgents = new Set(newEntry.rows.map(r => r.Agent));
    const existingAgents = new Set(overlap.file.rows.map(r => r.Agent));
    const commonAgents = [...newAgents].filter(agent => existingAgents.has(agent));
    
    return commonAgents.length > 0; // Same agents in overlapping time = potential double counting
  });
  
  return { overlaps, conflicts };
}

function getOverlapType(range1, range2) {
  if (range1.from === range2.from && range1.to === range2.to) return 'identical';
  if (range1.from >= range2.from && range1.to <= range2.to) return 'contained';
  if (range2.from >= range1.from && range2.to <= range1.to) return 'contains';
  return 'partial';
}

function generateContentHash(content, filename, size) {
  // Create a more sophisticated hash that includes key content characteristics
  const rows = parseCSVContent(content, filename).rows;
  const agentCount = new Set(rows.map(r => r.Agent)).size;
  const totalCalls = rows.reduce((sum, r) => sum + (r["Calls Answered"] || 0), 0);
  const contentSignature = `${agentCount}-${totalCalls}-${rows.length}`;
  
  return simpleHash(content + filename + size + contentSignature);
}

export function storeFiles(files) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  if (!db.files) db.files = [];
  
  const results = {
    stored: [],
    duplicates: [],
    overlaps: [],
    conflicts: []
  };

  const promises = Array.from(files).map(
    (file) =>
      new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => {
          const { rows, dateHint, dateRange } = parseCSVContent(reader.result, file.name);
          const hash = generateContentHash(reader.result, file.name, file.size);
          
          // Check if this exact file already exists
          const existingFile = db.files.find(f => f.id === hash);
          if (existingFile) {
            results.duplicates.push({
              file: file.name,
              existing: existingFile.name,
              reason: 'Identical content detected'
            });
            res({ status: 'duplicate', file: existingFile });
            return;
          }
          
          const newEntry = {
            id: hash,
            name: file.name,
            size: file.size,
            addedAt: Date.now(),
            date: dateHint,
            dateRange: dateRange,
            rows,
          };
          
          // Check for overlaps and conflicts with existing files
          const { overlaps, conflicts } = checkForOverlaps(newEntry, db.files);
          
          if (conflicts.length > 0) {
            results.conflicts.push({
              file: file.name,
              conflicts: conflicts.map(c => ({
                conflictsWith: c.file.name,
                type: c.overlapType,
                dateRange: c.newRange,
                existingRange: c.existingRange
              }))
            });
            
            // Still store the file but flag the conflict
            console.warn(`Conflict detected for ${file.name}:`, conflicts);
          }
          
          if (overlaps.length > 0) {
            results.overlaps.push({
              file: file.name,
              overlaps: overlaps.map(o => ({
                overlapsWith: o.file.name,
                type: o.overlapType,
                dateRange: o.newRange,
                existingRange: o.existingRange
              }))
            });
          }
          
          db.files.push(newEntry);
          results.stored.push(file.name);
          localStorage.setItem(KEY, JSON.stringify(db));
          res({ status: 'stored', file: newEntry, metadata: { overlaps, conflicts } });
        };
        reader.readAsText(file);
      })
  );
  
  return Promise.all(promises).then(fileResults => ({
    results: fileResults,
    summary: results
  }));
}

export function listFiles() {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  return db.files || [];
}

export function updateFileDate(id, isoDate) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  const f = (db.files || []).find((x) => x.id === id);
  if (f) {
    f.date = isoDate;
    localStorage.setItem(KEY, JSON.stringify(db));
  }
}

export function removeFile(id) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  db.files = (db.files || []).filter(f => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(db));
  return db.files;
}

export function getFileOverlaps(fileId) {
  const db = JSON.parse(localStorage.getItem(KEY) || '{"files":[]}');
  const files = db.files || [];
  const targetFile = files.find(f => f.id === fileId);
  
  if (!targetFile) return [];
  
  const { overlaps } = checkForOverlaps(targetFile, files);
  return overlaps;
}

export function analyzeDataIntegrity() {
  const files = listFiles();
  const analysis = {
    totalFiles: files.length,
    dateRanges: [],
    overlaps: [],
    potentialConflicts: []
  };
  
  // Analyze each file for overlaps
  files.forEach(file => {
    const { overlaps, conflicts } = checkForOverlaps(file, files);
    
    if (overlaps.length > 0) {
      analysis.overlaps.push({
        file: file.name,
        overlaps: overlaps.map(o => ({
          with: o.file.name,
          type: o.overlapType
        }))
      });
    }
    
    if (conflicts.length > 0) {
      analysis.potentialConflicts.push({
        file: file.name,
        conflicts: conflicts.map(c => ({
          with: c.file.name,
          commonAgents: [...new Set(file.rows.map(r => r.Agent))].filter(agent => 
            new Set(c.file.rows.map(r => r.Agent)).has(agent)
          )
        }))
      });
    }
    
    analysis.dateRanges.push({
      file: file.name,
      range: file.dateRange || { from: file.date, to: file.date }
    });
  });
  
  return analysis;
}
