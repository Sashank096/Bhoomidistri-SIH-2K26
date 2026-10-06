import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { DataSectionId } from '../../types';
import { SAMPLE_CSV_TEMPLATES } from '../../data/projectDataManagement';

interface DataUploadModuleProps {
  initialCategory?: DataSectionId;
  onImportData: (category: DataSectionId, rows: any[]) => void;
  onClose?: () => void;
}

export const DataUploadModule: React.FC<DataUploadModuleProps> = ({
  initialCategory = 'land',
  onImportData,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DataSectionId>(initialCategory);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadStep, setUploadStep] = useState<'upload' | 'mapping' | 'preview' | 'imported'>('upload');
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const categories: { id: DataSectionId; label: string }[] = [
    { id: 'land', label: 'Land Details' },
    { id: 'families', label: 'Affected Families' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'legal', label: 'Legal Disputes' },
    { id: 'documents', label: 'Documents' },
    { id: 'rr', label: 'R&R' },
    { id: 'possession', label: 'Possession' },
    { id: 'stakeholders', label: 'Stakeholders' },
  ];

  const handleDownloadTemplate = () => {
    const csvContent = SAMPLE_CSV_TEMPLATES[selectedCategory] || 'id,name,value\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BhoomiDrishti_${selectedCategory}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessFile = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });

    // Default mock parse for preview and column mapping
    setTimeout(() => {
      if (selectedCategory === 'land') {
        setColumnMappings({
          survey_no: 'Survey Number',
          area_acres: 'Area (Acres)',
          owner_name: 'Ownership',
          status: 'Acquisition Status',
        });
        setPreviewRows([
          { row: 1, survey: '148/1A', area: '3.2 ac', owner: 'P. Satyanarayana', status: 'Valid ✓', isValid: true },
          { row: 2, survey: '149/2B', area: '— (Missing)', owner: 'M. Venkatesh', status: 'Error ⚠ (Missing Area)', isValid: false },
          { row: 3, survey: '150/1', area: '2.8 ac', owner: 'K. Subba Rao', status: 'Valid ✓', isValid: true },
          { row: 4, survey: '151/4', area: '1.9 ac', owner: 'Smt. Anasuya', status: 'Valid ✓', isValid: true },
        ]);
        setValidCount(3);
        setErrorCount(1);
      } else {
        setColumnMappings({
          col1: 'Field 1',
          col2: 'Field 2',
          col3: 'Status',
        });
        setPreviewRows([
          { row: 1, survey: 'Record A', area: 'Valid', owner: 'Primary Party', status: 'Valid ✓', isValid: true },
          { row: 2, survey: 'Record B', area: 'Valid', owner: 'Secondary Party', status: 'Valid ✓', isValid: true },
        ]);
        setValidCount(2);
        setErrorCount(0);
      }
      setUploadStep('mapping');
    }, 400);
  };

  const handleFinalImport = () => {
    const validRowsToImport = previewRows.filter((r) => r.isValid);
    onImportData(selectedCategory, validRowsToImport);
    setUploadStep('imported');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#0B3520]" />
            <span>Upload Project Dataset (CSV / Excel)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Import structured bulk records into BhoomiDrishti schema with column mapping and error validation.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="flex items-center justify-between text-xs font-semibold px-2">
        <div className={`flex items-center gap-1.5 ${uploadStep === 'upload' ? 'text-[#0B3520] font-bold' : 'text-gray-400'}`}>
          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">1</span>
          <span>Upload File</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
        <div className={`flex items-center gap-1.5 ${uploadStep === 'mapping' ? 'text-[#0B3520] font-bold' : 'text-gray-400'}`}>
          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">2</span>
          <span>Column Mapping</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
        <div className={`flex items-center gap-1.5 ${uploadStep === 'preview' ? 'text-[#0B3520] font-bold' : 'text-gray-400'}`}>
          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">3</span>
          <span>Preview &amp; Validate</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
        <div className={`flex items-center gap-1.5 ${uploadStep === 'imported' ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">4</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Step 1: Category Selection & Upload Zone */}
      {uploadStep === 'upload' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Choose Dataset Category:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#0B3520] text-white border-[#0B3520] font-bold shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length > 0) {
                handleProcessFile(e.dataTransfer.files[0]);
              }
            }}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
              dragOver
                ? 'border-[#0B3520] bg-[#0B3520]/5 scale-[1.01]'
                : 'border-gray-300 bg-slate-50 hover:bg-slate-100/60'
            }`}
          >
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center mx-auto text-[#0B3520]">
                <FileSpreadsheet className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">Drag &amp; Drop CSV or Excel File</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supported formats: <span className="font-mono font-semibold">.CSV, .XLSX, .XLS</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <label className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white hover:bg-[#0B3520]/90 transition-all cursor-pointer shadow-xs">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleProcessFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {uploadStep === 'mapping' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-800">File Uploaded: </span>
              <span className="font-mono text-xs text-[#0B3520] font-bold">{uploadedFile?.name}</span>
              <span className="text-xs text-gray-500 ml-2">({uploadedFile?.size})</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Format Verified
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Map Uploaded Columns to BhoomiDrishti Schema:
            </h3>

            <div className="space-y-2 max-w-xl">
              {Object.entries(columnMappings).map(([uploadedCol, targetCol], idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="w-1/3 text-xs font-mono font-semibold text-gray-700 truncate">{uploadedCol}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={targetCol}
                    onChange={(e) => setColumnMappings({ ...columnMappings, [uploadedCol]: e.target.value })}
                    className="w-2/3 p-1.5 border rounded-lg text-xs bg-gray-50 text-gray-800 font-medium"
                  >
                    <option value="Survey Number">Survey Number</option>
                    <option value="Area (Acres)">Area (Acres)</option>
                    <option value="Ownership">Ownership</option>
                    <option value="Acquisition Status">Acquisition Status</option>
                    <option value="Head of Family">Head of Family</option>
                    <option value="Compensation Amount">Compensation Amount</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setUploadStep('upload')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setUploadStep('preview')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3520] flex items-center gap-1.5"
            >
              <span>Validate &amp; Preview Rows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview and Row Validation */}
      {uploadStep === 'preview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-[11px] text-gray-500">Rows Detected</div>
              <div className="font-mono text-base font-bold text-gray-900">{previewRows.length}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] text-emerald-700">Valid Rows</div>
              <div className="font-mono text-base font-bold text-emerald-800">{validCount}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="text-[11px] text-red-700">Rows with Errors</div>
              <div className="font-mono text-base font-bold text-red-800">{errorCount}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-60">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Identifier</th>
                  <th className="p-2.5">Value</th>
                  <th className="p-2.5">Party</th>
                  <th className="p-2.5">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewRows.map((r) => (
                  <tr key={r.row} className={r.isValid ? 'bg-white' : 'bg-red-50/40'}>
                    <td className="p-2.5 font-mono text-gray-500">{r.row}</td>
                    <td className="p-2.5 font-semibold text-gray-900">{r.survey}</td>
                    <td className="p-2.5 text-gray-700">{r.area}</td>
                    <td className="p-2.5 text-gray-700">{r.owner}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setUploadStep('mapping')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100"
            >
              Re-map Columns
            </button>

            <button
              type="button"
              onClick={handleFinalImport}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0B3520] hover:bg-[#0B3520]/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Import {validCount} Valid Records</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Imported Success */}
      {uploadStep === 'imported' && (
        <div className="text-center py-8 space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Dataset Imported Successfully</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Imported records have been appended to your draft project database and are ready for review and validation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUploadStep('upload')}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B3520] text-white"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
};
