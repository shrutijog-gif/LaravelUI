import React, { useState } from 'react';
import { 
  Award, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  ExternalLink, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Edit3, 
  X,
  FileCheck,
  Building,
  BarChart3
} from 'lucide-react';
import { getActiveTenant } from '../../../../data/tenantData';

interface NirfReport {
  id: string;
  title: string;
  year: string;
  category: 'Overall' | 'College' | 'Research' | 'Discipline' | 'Placement';
  fileSize: string;
  uploadDate: string;
  fileUrl: string;
  status: 'Published' | 'Draft';
}

const defaultReports: NirfReport[] = [
  {
    id: 'nirf-1',
    title: 'NIRF 2026 Full Institutional Data Report (Overall Category)',
    year: '2026',
    category: 'Overall',
    fileSize: '3.4 MB',
    uploadDate: '15 Jan 2026',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Published'
  },
  {
    id: 'nirf-2',
    title: 'NIRF 2026 College Category Statutory Disclosure Report',
    year: '2026',
    category: 'College',
    fileSize: '2.8 MB',
    uploadDate: '15 Jan 2026',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Published'
  },
  {
    id: 'nirf-3',
    title: 'NIRF 2026 Research, Patents (IPR) & Sponsored Projects Summary',
    year: '2026',
    category: 'Research',
    fileSize: '1.9 MB',
    uploadDate: '18 Jan 2026',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Published'
  },
  {
    id: 'nirf-4',
    title: 'NIRF 2025 Approved DCS (Data Capturing System) Complete Dossier',
    year: '2025',
    category: 'Overall',
    fileSize: '4.1 MB',
    uploadDate: '12 Jan 2025',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Published'
  },
  {
    id: 'nirf-5',
    title: 'NIRF 2025 Student Placement & Higher Studies Verified Statistics',
    year: '2025',
    category: 'Placement',
    fileSize: '1.5 MB',
    uploadDate: '20 Jan 2025',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Published'
  }
];

export const NirfShowcaseAdmin: React.FC = () => {
  const tenant = getActiveTenant();
  const [reports, setReports] = useState<NirfReport[]>(() => {
    try {
      const saved = localStorage.getItem('nirf_showcase_reports');
      return saved ? JSON.parse(saved) : defaultReports;
    } catch {
      return defaultReports;
    }
  });

  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New report form state
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newCategory, setNewCategory] = useState<'Overall' | 'College' | 'Research' | 'Discipline' | 'Placement'>('Overall');
  const [selectedFileName, setSelectedFileName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReport: NirfReport = {
      id: `nirf-${Date.now()}`,
      title: newTitle.trim(),
      year: newYear,
      category: newCategory,
      fileSize: selectedFileName ? '2.1 MB' : '1.8 MB',
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      status: 'Published'
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    try {
      localStorage.setItem('nirf_showcase_reports', JSON.stringify(updated));
    } catch {}

    setIsModalOpen(false);
    setNewTitle('');
    setSelectedFileName('');
    showToast('NIRF Disclosure Document published successfully!');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      try {
        localStorage.setItem('nirf_showcase_reports', JSON.stringify(updated));
      } catch {}
      showToast('Document removed successfully');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesYear = selectedYear === 'All' || r.year === selectedYear;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>National Institutional Ranking Framework (NIRF)</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">NIRF Showcase &amp; Disclosures</h1>
          <p className="text-xs text-gray-500 mt-1">
            Statutory disclosures, annual ranking data files, and parameter scorecards for {tenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="?mode=storefront"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>View Public Showcase</span>
          </a>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload NIRF Document</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Overall NIRF Rank</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Award className="w-4 h-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">#24</span>
            <span className="text-xs font-bold text-emerald-600">Top 1% in India</span>
          </div>
          <p className="text-[11px] text-gray-400">All India Institutional Ranking 2026</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Colleges Category</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><Building className="w-4 h-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">#8</span>
            <span className="text-xs font-bold text-emerald-600">State Rank #2</span>
          </div>
          <p className="text-[11px] text-gray-400">Autonomous &amp; Constituent Colleges</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Cumulative NIRF Score</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">78.45</span>
            <span className="text-xs font-bold text-gray-500">/ 100</span>
          </div>
          <p className="text-[11px] text-gray-400">Weighted aggregate across 5 criteria</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Reports Disclosed</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><FileCheck className="w-4 h-4" /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{reports.length}</span>
            <span className="text-xs font-bold text-emerald-600">All Verified</span>
          </div>
          <p className="text-[11px] text-gray-400">Mandatory Ministry of Education filings</p>
        </div>
      </div>

      {/* NIRF 5 Parameter Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Official NIRF Evaluation Parameters</h3>
            <p className="text-xs text-gray-500">Performance metrics calculated under Ministry of Education Guidelines</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            NIRF Cycle 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">TLR</span>
              <span className="font-black text-blue-600">82.3 / 100</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '82.3%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Teaching, Learning &amp; Resources</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">RPC</span>
              <span className="font-black text-purple-600">74.8 / 100</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '74.8%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Research &amp; Professional Practice</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">GO</span>
              <span className="font-black text-emerald-600">86.1 / 100</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '86.1%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Graduation Outcomes (Placements)</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">OI</span>
              <span className="font-black text-amber-600">76.5 / 100</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '76.5%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Outreach &amp; Inclusivity</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">PR</span>
              <span className="font-black text-rose-600">72.6 / 100</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: '72.6%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Peer Perception</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reports or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-gray-300 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-gray-400"
            >
              <option value="All">All Years</option>
              <option value="2026">NIRF 2026</option>
              <option value="2025">NIRF 2025</option>
              <option value="2024">NIRF 2024</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredReports.length}</strong> statutory documents
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/60 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-5">Document Title</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Uploaded On</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No NIRF documents found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <a 
                            href={report.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="font-bold text-gray-900 hover:text-blue-600 hover:underline leading-snug"
                          >
                            {report.title}
                          </a>
                          <span className="block text-[10px] text-gray-400 mt-0.5">Statutory PDF Public Disclosure Document</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {report.year}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                        {report.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {report.fileSize}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {report.uploadDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md hover:bg-gray-100 text-blue-600 transition-colors"
                          title="Download / View PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(report.id, report.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload NIRF Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Upload NIRF Statutory Report</h3>
                  <p className="text-xs text-gray-500">Publish public disclosure PDF data file</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReport} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIRF 2026 Research & Patents Summary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">NIRF Cycle Year</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
                  >
                    <option value="Overall">Overall</option>
                    <option value="College">College</option>
                    <option value="Research">Research</option>
                    <option value="Placement">Placement</option>
                    <option value="Discipline">Discipline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Attach PDF File *</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="nirf-file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="nirf-file-upload" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-blue-600 hover:underline block">
                      {selectedFileName || 'Click to select NIRF PDF file'}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-1">Accepts PDF up to 15MB</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
