import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { Printer, RefreshCw, ChevronDown, ChevronRight, Hash, DollarSign, BarChart, Info } from "lucide-react";
import { api } from "../../../services/api"; 
import { toggleToaster } from "../../../provider/features/helperSlice"; 
import { useDispatch } from "react-redux";

// --- Type Definitions ---
type LedgerAccountType = {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string | null;
  is_active: boolean;
  general_ledger_name?: string;
  account_name?: string;
  nominal_code?: string;
  parent_name?: string;
};

type LedgerHeadingType = {
  general_ledger_id: number;
  general_ledger_name: string;
  type: string;
};

type GroupedAccount = {
  parent: LedgerAccountType;
  children: LedgerAccountType[];
};

type SummaryStats = {
  totalAccounts: number;
  activeAccounts: number;
  parentAccounts: number;
  subAccounts: number;
  accountTypes: number;
};
// ------------------------

const NominalLedgerLayout: React.FC = () => {
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccountType[]>([]);
  const [ledgerHeadings, setLedgerHeadings] = useState<LedgerHeadingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [groupByParent, setGroupByParent] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [repeatHeader, setRepeatHeader] = useState(false);
  const [summary, setSummary] = useState<SummaryStats>({
      totalAccounts: 0,
      activeAccounts: 0,
      parentAccounts: 0,
      subAccounts: 0,
      accountTypes: 0,
  });


  const dispatch = useDispatch();
  
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
    documentTitle: 'Nominal Ledger Layout',
    onBeforeGetContent: () => {
        // Expand all groups before printing
        const parentIds = ledgerAccounts
            .filter((acc: LedgerAccountType) => !acc.parent_id)
            .map((acc: LedgerAccountType) => acc.id);
        setExpandedGroups(new Set(parentIds));
        return Promise.resolve();
    }
  } as any);

  // --- Data Fetching and Utility Functions ---
  const calculateSummary = (accounts: LedgerAccountType[], headings: LedgerHeadingType[]): SummaryStats => {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(acc => acc.is_active).length;
    const parentAccounts = accounts.filter(acc => !acc.parent_id).length;
    const subAccounts = accounts.filter(acc => acc.parent_id).length;
    const accountTypes = new Set(headings.map(h => h.type)).size;

    return { totalAccounts, activeAccounts, parentAccounts, subAccounts, accountTypes };
  };

  const fetchNominalLedgerData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/nominal-ledger");
      const data = response.data.data;
      
      const accounts = data.accounts || [];
      const headings = data.headings || [];

      const accountMap = new Map();
      accounts.forEach((account: LedgerAccountType) => {
        accountMap.set(account.id, account);
      });

      const mappedAccounts = accounts.map((account: LedgerAccountType) => {
        let displayName = account.name;
        
        if (account.parent_id && accountMap.get(account.parent_id)) {
          const parentAccount = accountMap.get(account.parent_id);
          displayName = `${parentAccount.name} - ${account.name}`;
        }

        return {
          ...account,
          general_ledger_name: account.type.toUpperCase(),
          account_name: displayName,
          nominal_code: account.code,
          parent_name: account.parent_id ? accountMap.get(account.parent_id)?.name : null
        };
      });

      setLedgerHeadings(headings);
      setLedgerAccounts(mappedAccounts);
      setSummary(calculateSummary(mappedAccounts, headings));

      const parentIds = mappedAccounts
        .filter((acc: LedgerAccountType) => !acc.parent_id)
        .map((acc: LedgerAccountType) => acc.id);
      setExpandedGroups(new Set(parentIds));
    } catch (error) {
      console.error("Error fetching nominal ledger data", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to load nominal ledger data" 
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominalLedgerData();
  }, []);

  const handleRefresh = () => {
    fetchNominalLedgerData();
  };

  const toggleGroup = (parentId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleGrouping = () => {
    setGroupByParent(!groupByParent);
  };
  
  const toggleRepeatHeader = () => {
    setRepeatHeader(prev => !prev);
  }

  const getAccountsGroupedByParent = () => {
    const parentAccounts = ledgerAccounts.filter((acc: LedgerAccountType) => !acc.parent_id);
    const childAccounts = ledgerAccounts.filter((acc: LedgerAccountType) => acc.parent_id);
    
    const grouped: GroupedAccount[] = parentAccounts.map(parent => ({
      parent,
      children: childAccounts.filter(child => child.parent_id === parent.id)
    }));

    return grouped;
  };

  const getTypeDisplayName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'asset': 'Assets',
      'liability': 'Liabilities', 
      'equity': 'Equity',
      'income': 'Income',
      'expense': 'Expenses'
    };
    return typeMap[type.toLowerCase()] || type;
  };

  const getAccountsGroupedByTypeWithParents = () => {
    const result: { [key: string]: GroupedAccount[] } = {};
    
    ledgerHeadings.forEach(heading => {
      const typeParents = ledgerAccounts.filter((acc: LedgerAccountType) => 
        !acc.parent_id && acc.type === heading.type
      );
      
      result[heading.type] = typeParents.map(parent => ({
        parent,
        children: ledgerAccounts.filter(child => 
          child.parent_id === parent.id
        )
      }));
    });
    
    return result;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const typeGroupedAccounts = getAccountsGroupedByTypeWithParents();
  
  const reportHeaderClass = repeatHeader ? 'report-header-repeat' : 'report-header-once';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      
      {/* 1. Print CSS Styles */}
      <style>
        {`
        .printable-content {
          height: 700px;
          overflow-y: auto;
        }

        @media print {
          .printable-content {
            height: auto !important;
            overflow: visible !important;
          }
          @page { 
            size: A4; 
            margin: 15mm; 
          }
          body { 
            font-family: Arial, sans-serif; 
          }
          table { 
            page-break-inside: auto;
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          .data-table > thead { 
            display: table-header-group;
          }
          .parent-account { 
            background-color: #f8f9fa !important; 
            font-weight: 600; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          /* === REPEAT HEADER STYLES FIX === */
          .report-header-repeat {
              position: fixed; 
              top: 0;
              width: 100%;
              z-index: 1000;
              padding: 15mm; /* Matches the @page margin */
              background: white; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }

          /* Class applied to the main content wrapper when repeating is active */
          .apply-page-break-padding-fix {
            margin-top: 150px; /* Reserves space for the fixed header */
          }
          
          .report-header-once {
              page-break-after: avoid; 
          }
          
          /* Ensure the summary/footer areas are hidden when printing */
          .print-hidden-section {
              display: none;
          }
        }
        `}
      </style>

      {/* Header (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominal Ledger Layout</h1>
          <p className="text-gray-600 mt-1">Chart of Accounts Structure Overview</p>
        </div>
        
        <div className="flex items-center space-x-3">
          
          {/* Repeat Header Checkbox */}
          {/* <div className="flex items-center mr-4">
            <input
              id="repeatHeader"
              type="checkbox"
              checked={repeatHeader}
              onChange={toggleRepeatHeader}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="repeatHeader" className="ml-2 text-sm font-medium text-gray-700">
              Repeat Title on Pages
            </label>
          </div> */}
          
          <button
            onClick={toggleGrouping}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {groupByParent ? 'Group by Type' : 'Group by Parent'}
          </button>
          
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Ledger Layout (Printable Content) */}
      <div 
        ref={componentRef} 
        className="bg-white  printable-content" 
        id="general_ledger_print"
      >
        <div className="p-2">

          {/* 2. REPORT TITLE BLOCK (ONE-TIME HEADER) */}
          <div className={`${reportHeaderClass} mb-4`}>
            <table className="w-full table-auto border-collapse border border-gray-300 report-header-table">
              <tbody>
                {/* Report Title Row */}
                <tr>
                  <td 
                    className="border border-gray-300 p-4 text-center align-middle"
                    colSpan={2}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-500 text-sm">Bank Logo</span>
                      </div>
                      
                      <div className="text-center flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">GENERAL LEDGER</h2>
                        <p className="text-gray-600 mt-1">
                          {groupByParent ? 'Grouped by Parent Accounts' : 'Grouped by Account Type'}
                        </p>
                      </div>
                      
                      <div className="w-24"></div>
                    </div>
                  </td>
                </tr>
                
                {/* Date/Address Row */}
                <tr>
                  <td 
                    className="border border-gray-300 p-3 text-center"
                    colSpan={2}
                  >
                    <div className="space-y-1">
                      <h4 className="text-lg font-semibold text-gray-800">Bank Name Here</h4>
                      <h5 className="text-md text-gray-600">MAIN BRANCH</h5>
                      <h5 className="text-sm text-gray-500">
                        {currentDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </h5>
                    </div>
                  </td>
                </tr>
                
                {/* Nominal Layout row (Part of the fixed/one-time header) */}
                <tr>
                  <td 
                    colSpan={2} 
                    className="border border-gray-300 p-3 text-center bg-gray-50"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">
                        Structure is NOMINAL LAYOUT
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Accounts: {ledgerAccounts.length}
                      </p>
                    </div>
                  </td>
                </tr>
                
              </tbody>
            </table>
          </div>
          {/* END REPORT TITLE BLOCK */}

          <center id="ledger_center_table">
            
            {/* Conditional class for spacing the content below the fixed header */}
            <div className={`ledger-table-wrapper ${repeatHeader ? 'apply-page-break-padding-fix' : ''}`}>
                <table className="w-full table-auto border-collapse border border-gray-300 data-table">
                
                {/* 3. REPEATING HEADER (THEAD) - This repeats the column titles */}
                <thead>
                    <tr>
                        <th className="w-1/4 p-2 border border-gray-300 text-sm text-left font-bold bg-gray-100">Code</th>
                        <th className="w-3/4 p-2 border border-gray-300 text-sm text-left font-bold bg-gray-100">Account Name & Description</th>
                    </tr>
                </thead>
                {/* END REPEATING HEADER */}

                <tbody>
                    {/* --- Table Body Content (Grouping logic remains) --- */}
                    {groupByParent ? (
                    // Group by Parent display
                    getAccountsGroupedByParent().map((group) => (
                        <React.Fragment key={group.parent.id}>
                        {/* Parent Row */}
                        <tr className="bg-gray-50 parent-account">
                            <td 
                            colSpan={2} 
                            className="border border-gray-300 p-2 font-bold text-gray-800 cursor-pointer hover:bg-gray-100 print:cursor-default print:hover:bg-gray-50"
                            onClick={() => toggleGroup(group.parent.id)}
                            >
                            <div className="flex items-center">
                                {expandedGroups.has(group.parent.id) ? (
                                <ChevronDown size={16} className="mr-2 print:hidden" />
                                ) : (
                                <ChevronRight size={16} className="mr-2 print:hidden" />
                                )}
                                <span className="print:ml-0">
                                {group.parent.name} - {getTypeDisplayName(group.parent.type)}
                                </span>
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                ({group.children.length} sub-accounts)
                                </span>
                            </div>
                            </td>
                        </tr>
                        
                        {/* Children Rows */}
                        {expandedGroups.has(group.parent.id) && group.children.map((child) => (
                            <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                            <td className="border border-gray-300 p-2 text-right font-mono text-sm text-gray-600 w-1/4 child-account">
                                {child.code}
                            </td>
                            <td className="border border-gray-300 p-2 text-gray-700 child-account">
                                {child.name}
                                {child.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {child.description}
                                </p>
                                )}
                            </td>
                            </tr>
                        ))}
                        </React.Fragment>
                    ))
                    ) : (
                    // Traditional grouping by type
                    ledgerHeadings.map((heading) => {
                        const typeGroups = typeGroupedAccounts[heading.type] || [];
                        const hasAccounts = typeGroups.some(group => group.parent || group.children.length > 0);
                        
                        if (!hasAccounts) return null;
                        
                        return (
                        <React.Fragment key={heading.general_ledger_id}>
                            {/* Type Header Row */}
                            <tr className="bg-gray-50">
                            <td 
                                colSpan={2} 
                                className="border border-gray-300 p-3 font-bold text-gray-800 uppercase"
                            >
                                {heading.general_ledger_name}
                            </td>
                            </tr>
                            
                            {typeGroups.map((group) => (
                            <React.Fragment key={group.parent.id}>
                                {/* Parent Row */}
                                <tr className="parent-account">
                                <td 
                                    colSpan={2} 
                                    className="border border-gray-300 p-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 print:cursor-default print:hover:bg-gray-50"
                                    onClick={() => toggleGroup(group.parent.id)}
                                >
                                    <div className="flex items-center">
                                    {expandedGroups.has(group.parent.id) ? (
                                        <ChevronDown size={16} className="mr-2 print:hidden" />
                                    ) : (
                                        <ChevronRight size={16} className="mr-2 print:hidden" />
                                    )}
                                    <span className="print:ml-0">
                                        {group.parent.name}
                                    </span>
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({group.children.length} sub-accounts)
                                    </span>
                                    </div>
                                </td>
                                </tr>
                                
                                {/* Children Rows */}
                                {expandedGroups.has(group.parent.id) && group.children.map((child) => (
                                <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-300 p-2 text-right font-mono text-sm text-gray-600 w-1/4 child-account">
                                    {child.code}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-gray-700 child-account">
                                    {child.name}
                                    {child.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                        {child.description}
                                        </p>
                                    )}
                                    </td>
                                </tr>
                                ))}
                            </React.Fragment>
                            ))}
                        </React.Fragment>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
          </center>
        </div>
      </div>
      
      {/* 4. Summary Stats (Hidden during print) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print-hidden-section print:hidden">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
            <Hash className="text-blue-500" size={24} />
            <div>
                <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                <p className="text-xl font-semibold text-gray-900">{summary.totalAccounts}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
            <DollarSign className="text-green-500" size={24} />
            <div>
                <p className="text-sm font-medium text-gray-500">Parent Accounts</p>
                <p className="text-xl font-semibold text-gray-900">{summary.parentAccounts}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
            <BarChart className="text-yellow-500" size={24} />
            <div>
                <p className="text-sm font-medium text-gray-500">Sub-Accounts</p>
                <p className="text-xl font-semibold text-gray-900">{summary.subAccounts}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
            <Info className="text-purple-500" size={24} />
            <div>
                <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                <p className="text-xl font-semibold text-gray-900">{summary.activeAccounts}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center space-x-3">
            <Info className="text-red-500" size={24} />
            <div>
                <p className="text-sm font-medium text-gray-500">Unique Types</p>
                <p className="text-xl font-semibold text-gray-900">{summary.accountTypes}</p>
            </div>
        </div>
      </div>
      
      {/* 5. Additional Information (Hidden during print) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print-hidden-section print:hidden">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center mb-2">
            <Info size={20} className="mr-2"/> Report Information
        </h3>
        <p className="text-sm text-blue-700">
            This Nominal Ledger Layout report provides a complete, hierarchical view of the bank's Chart of Accounts. 
            Accounts are displayed with their nominal codes and descriptions. 
            The **"Group by Parent"** toggle offers a clean, structural visualization, while **"Group by Type"** provides the traditional financial statement grouping (Assets, Liabilities, etc.).
        </p>
      </div>

    </motion.div>
  );
};

export default NominalLedgerLayout;