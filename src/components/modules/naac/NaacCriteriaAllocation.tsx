import React, { useState, useEffect } from 'react';
import {
  Home,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  X,
  ArrowRight
} from 'lucide-react';
import {
  NAAC_CRITERIA_SUMMARY,
  ITM_SCHOOLS,
  CSE_DEPARTMENT_FACULTY,
  type NaacHierarchyMode,
  HIERARCHY_CONFIGS,
  getTenantDefaultHierarchyMode,
  setTenantHierarchyMode,
} from '../../../data/naacDmsData';
import { getActiveTenant, CollegeTenant } from '../../../data/tenantData';

interface CriterionAllocationRow {
  id: string;
  criterionCode: string;
  criterionName: string;
  unitName: string;
  coordinatorName: string;
  coordinatorRole: string;
  email: string;
  facultyLeads: string;
}

const DEFAULT_ALLOCATIONS: CriterionAllocationRow[] = [
  {
    id: 'alloc-1',
    criterionCode: 'Criterion 1',
    criterionName: 'Curricular Aspects',
    unitName: 'School of Technology / B.Tech CSE',
    coordinatorName: 'Prof. Anita Verma',
    coordinatorRole: 'Program / Dept Coordinator',
    email: 'cse.coord@itmuniversity.edu',
    facultyLeads: 'Prof. Priyanka Deshmukh',
  },
  {
    id: 'alloc-2',
    criterionCode: 'Criterion 2',
    criterionName: 'Teaching-Learning and Evaluation',
    unitName: 'School of Technology / B.Tech CSE',
    coordinatorName: 'Prof. Anita Verma',
    coordinatorRole: 'Program / Dept Coordinator',
    email: 'cse.coord@itmuniversity.edu',
    facultyLeads: 'Dr. Ramesh Gupta',
  },
  {
    id: 'alloc-3',
    criterionCode: 'Criterion 3',
    criterionName: 'Research, Innovations and Extension',
    unitName: 'School of Technology',
    coordinatorName: 'Dr. Rajesh Sharma',
    coordinatorRole: 'School Coordinator',
    email: 'tech.naac@itmuniversity.edu',
    facultyLeads: 'Dr. Arun Joshi',
  },
  {
    id: 'alloc-4',
    criterionCode: 'Criterion 4',
    criterionName: 'Infrastructure and Learning Resources',
    unitName: 'School of Management / MBA',
    coordinatorName: 'Dr. Manisha Patil',
    coordinatorRole: 'School Coordinator',
    email: 'mba.coord@itmuniversity.edu',
    facultyLeads: 'Prof. Sneha Patel',
  },
  {
    id: 'alloc-5',
    criterionCode: 'Criterion 5',
    criterionName: 'Student Support and Progression',
    unitName: 'All Departments',
    coordinatorName: 'Prof. Vikas Shinde',
    coordinatorRole: 'Student Progression Lead',
    email: 'v.shinde@itmuniversity.edu',
    facultyLeads: 'Prof. Vikas Shinde',
  },
  {
    id: 'alloc-6',
    criterionCode: 'Criterion 6',
    criterionName: 'Governance, Leadership and Management',
    unitName: 'Central IQAC Directorate',
    coordinatorName: 'Dr. Vikram Malhotra',
    coordinatorRole: 'IQAC Coordinator',
    email: 'iqac.director@itmuniversity.edu',
    facultyLeads: 'Prof. Amit Saxena',
  },
  {
    id: 'alloc-7',
    criterionCode: 'Criterion 7',
    criterionName: 'Institutional Values and Best Practices',
    unitName: 'Central IQAC Directorate',
    coordinatorName: 'Dr. Vikram Malhotra',
    coordinatorRole: 'IQAC Coordinator',
    email: 'iqac.director@itmuniversity.edu',
    facultyLeads: 'Dr. Neha Kulkarni',
  },
];

interface NaacCriteriaAllocationProps {
  onBackToCycles?: () => void;
}

export const NaacCriteriaAllocation: React.FC<NaacCriteriaAllocationProps> = ({
  onBackToCycles,
}) => {
  const [tenant, setTenant] = useState<CollegeTenant>(() => getActiveTenant());
  const [hierarchyMode, setHierarchyMode] = useState<NaacHierarchyMode>(() =>
    getTenantDefaultHierarchyMode(getActiveTenant().id)
  );
  const [allocations, setAllocations] = useState<CriterionAllocationRow[]>(() => {
    try {
      const saved = localStorage.getItem('cms_naac_criteria_allocations_v1');
      return saved ? JSON.parse(saved) : DEFAULT_ALLOCATIONS;
    } catch {
      return DEFAULT_ALLOCATIONS;
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [critCodeInput, setCritCodeInput] = useState('Criterion 1');
  const [unitNameInput, setUnitNameInput] = useState('B.Tech Computer Science');
  const [coordNameInput, setCoordNameInput] = useState('Prof. Anita Verma');
  const [coordRoleInput, setCoordRoleInput] = useState('Department / Program Coordinator');
  const [facultyInput, setFacultyInput] = useState('Dr. Ramesh Gupta');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const syncTenant = () => {
      const active = getActiveTenant();
      setTenant(active);
      setHierarchyMode(getTenantDefaultHierarchyMode(active.id));
    };
    window.addEventListener('tenant-changed', syncTenant);
    window.addEventListener('naac-hierarchy-changed', syncTenant);
    return () => {
      window.removeEventListener('tenant-changed', syncTenant);
      window.removeEventListener('naac-hierarchy-changed', syncTenant);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectHierarchy = (mode: NaacHierarchyMode) => {
    setHierarchyMode(mode);
    setTenantHierarchyMode(tenant.id, mode);
    showToast(`Hierarchy updated to: ${HIERARCHY_CONFIGS[mode].shortLabel}`);
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const critObj =
      NAAC_CRITERIA_SUMMARY.find((c) => c.code === critCodeInput) || NAAC_CRITERIA_SUMMARY[0];
    const newRow: CriterionAllocationRow = {
      id: `alloc-${Date.now()}`,
      criterionCode: critObj.code,
      criterionName: critObj.name,
      unitName: unitNameInput,
      coordinatorName: coordNameInput,
      coordinatorRole: coordRoleInput,
      email: `${coordNameInput.toLowerCase().replace(/[^a-z]/g, '.')}@college.edu`,
      facultyLeads: facultyInput,
    };
    const updated = [...allocations, newRow];
    setAllocations(updated);
    localStorage.setItem('cms_naac_criteria_allocations_v1', JSON.stringify(updated));
    setIsDrawerOpen(false);
    showToast(`Allocated ${critObj.code} to ${coordNameInput}`);
  };

  const handleDeleteAllocation = (id: string) => {
    const updated = allocations.filter((a) => a.id !== id);
    setAllocations(updated);
    localStorage.setItem('cms_naac_criteria_allocations_v1', JSON.stringify(updated));
    showToast('Allocation removed.');
  };

  return (
    <div className="w-full space-y-6">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <Home className="w-3.5 h-3.5 text-gray-500" />
          <span>/</span>
          <span>NAAC</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">Criteria Allocation & Hierarchy</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onBackToCycles && (
            <button
              onClick={onBackToCycles}
              className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Go to Cycle (SSR)
            </button>
          )}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#1d4ed8] hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Allocate Criteria</span>
          </button>
        </div>
      </div>

      {/* Section 1: Multi-Tenant Hierarchy Structure Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              1. Institution Organizational Hierarchy ({tenant.name})
            </h2>
            <p className="text-xs text-gray-500">
              Different institutions have different NAAC approval flows (University → Schools → Programs vs. College → Departments). Select the workflow for this tenant:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(HIERARCHY_CONFIGS) as NaacHierarchyMode[]).map((modeKey) => {
            const cfg = HIERARCHY_CONFIGS[modeKey];
            const isSelected = hierarchyMode === modeKey;
            return (
              <div
                key={modeKey}
                onClick={() => handleSelectHierarchy(modeKey)}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                      {cfg.roles.length} Approval Levels
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{cfg.shortLabel}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{cfg.description}</p>
                </div>

                {/* Visual Chain of Roles */}
                <div className="pt-3 border-t border-gray-200/70 flex flex-wrap items-center gap-1.5">
                  {cfg.roles.map((r, i) => (
                    <React.Fragment key={r.id}>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-800">
                        {r.title}
                      </span>
                      {i < cfg.roles.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Criteria 1-7 & Unit Allocation Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              2. Criteria Allocation Matrix (Criteria 1 to 7)
            </h2>
            <p className="text-xs text-gray-500">
              Assigned Schools, Departments, Program Coordinators, and Faculty Leads for the active SSR Cycle.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                <th className="py-3 px-4">Criterion</th>
                <th className="py-3 px-4">
                  {hierarchyMode === 'university_schools'
                    ? 'Assigned School / Program'
                    : 'Assigned Department / Unit'}
                </th>
                <th className="py-3 px-4">Coordinator In-Charge</th>
                <th className="py-3 px-4">Faculty Contributors</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {allocations.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{row.criterionCode}</div>
                    <div className="text-gray-500">{row.criterionName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{row.unitName}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{row.coordinatorName}</div>
                    <div className="text-[11px] text-blue-600 font-medium">
                      {row.coordinatorRole}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{row.facultyLeads}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteAllocation(row.id)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Allocation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer to Add Allocation */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Allocate Criterion</h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="alloc-form" onSubmit={handleSaveAllocation} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Select Criterion *
                  </label>
                  <select
                    value={critCodeInput}
                    onChange={(e) => setCritCodeInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none"
                  >
                    {NAAC_CRITERIA_SUMMARY.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    {hierarchyMode === 'university_schools'
                      ? 'School / Program Unit *'
                      : 'Department / Unit *'}
                  </label>
                  <input
                    type="text"
                    value={unitNameInput}
                    onChange={(e) => setUnitNameInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Coordinator Name *
                  </label>
                  <input
                    type="text"
                    value={coordNameInput}
                    onChange={(e) => setCoordNameInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Role Level *
                  </label>
                  <select
                    value={coordRoleInput}
                    onChange={(e) => setCoordRoleInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none"
                  >
                    <option value="Department / Program Coordinator">
                      Department / Program Coordinator
                    </option>
                    <option value="School Coordinator">School Coordinator</option>
                    <option value="IQAC Coordinator">IQAC Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Assigned Faculty Member(s)
                  </label>
                  <input
                    type="text"
                    value={facultyInput}
                    onChange={(e) => setFacultyInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="alloc-form"
                className="px-5 py-2 rounded-lg bg-[#1d4ed8] text-white text-xs font-semibold cursor-pointer"
              >
                Save Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

