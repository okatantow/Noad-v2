import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {  Printer, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";

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

const NominalLedgerLayout: React.FC = () => {
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccountType[]>([]);
  const [ledgerHeadings, setLedgerHeadings] = useState<LedgerHeadingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());
  const [groupByParent, setGroupByParent] = useState(true); // Toggle between parent and type grouping
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const dispatch = useDispatch();

  const fetchNominalLedgerData = async () => {
    try {
      setLoading(true);
      // Use the nominal-ledger route instead of chart-of-accounts
      const response = await api.get("/nominal-ledger");
      const data = response.data.data;
      
      const accounts = data.accounts || [];
      const headings = data.headings || [];

      // Create a map for quick parent lookups
      const accountMap = new Map();
      accounts.forEach((account: LedgerAccountType) => {
        accountMap.set(account.id, account);
      });

      // Map accounts to include formatted display names
      const mappedAccounts = accounts.map((account: LedgerAccountType) => {
        let displayName = account.name;
        
        // If account has a parent, format as "Parent Name - Account Name"
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

  const handlePrint = () => {
    const printContent = document.getElementById('general_ledger_print');
    const printWindow = window.open('', '_blank');
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Nominal Ledger Layout</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .logo { max-width: 150px; height: auto; }
              .section-header { background-color: #f0f0f0 !important; font-weight: bold; }
              .child-account { padding-left: 30px !important; }
              .parent-account { background-color: #f8f9fa !important; font-weight: 600; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

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

  // Group accounts by parent for hierarchical display
  const getAccountsGroupedByParent = () => {
    const parentAccounts = ledgerAccounts.filter(acc => !acc.parent_id);
    const childAccounts = ledgerAccounts.filter(acc => acc.parent_id);
    
    const grouped: GroupedAccount[] = parentAccounts.map(parent => ({
      parent,
      children: childAccounts.filter(child => child.parent_id === parent.id)
    }));

    return grouped;
  };

  // Group accounts by type (traditional way)
  const getAccountsByType = (type: string) => {
    return ledgerAccounts.filter(account => account.type === type.toLowerCase());
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

  // Get accounts grouped by type with parent hierarchy
  const getAccountsGroupedByTypeWithParents = () => {
    const result: { [key: string]: GroupedAccount[] } = {};
    
    ledgerHeadings.forEach(heading => {
      const typeParents = ledgerAccounts.filter(acc => 
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominal Ledger Layout</h1>
          <p className="text-gray-600 mt-1">Chart of Accounts Structure Overview</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Grouping Toggle */}
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

      {/* Ledger Layout */}
      <div 
        style={{ height: '700px', overflow: 'auto' }} 
        id="general_ledger_print"
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <div className="p-6">
          <center id="ledger_center_table">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead id="thead1">
                <tr id="tr1">
                  <th 
                    id="report_title" 
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
                  </th>
                </tr>
                
                <tr>
                  <th 
                    id="address" 
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
                  </th>
                </tr>
              </thead>

              <thead id="thead2">
                <tr id="tr2">
                  <th 
                    colSpan={2} 
                    id="description"
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
                  </th>
                </tr>
              </thead>

              <tbody>
                {groupByParent ? (
                  // Group by Parent display (SAVINGS - Liability, LOANS - Asset, etc.)
                  getAccountsGroupedByParent().map((group) => (
                    <React.Fragment key={group.parent.id}>
                      <tr className="bg-gray-50 parent-account">
                        <td 
                          colSpan={2} 
                          className="border border-gray-300 p-2 font-bold text-gray-800 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleGroup(group.parent.id)}
                        >
                          <div className="flex items-center">
                            {expandedGroups.has(group.parent.id) ? (
                              <ChevronDown size={16} className="mr-2" />
                            ) : (
                              <ChevronRight size={16} className="mr-2" />
                            )}
                            <span>
                              {group.parent.name} - {getTypeDisplayName(group.parent.type)}
                            </span>
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({group.children.length} sub-accounts)
                            </span>
                          </div>
                        </td>
                      </tr>
                      
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
                  // Traditional grouping by type (Assets, Liabilities, etc.)
                  ledgerHeadings.map((heading) => {
                    const typeGroups = typeGroupedAccounts[heading.type] || [];
                    const hasAccounts = typeGroups.some(group => group.parent || group.children.length > 0);
                    
                    if (!hasAccounts) return null;
                    
                    return (
                      <React.Fragment key={heading.general_ledger_id}>
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
                            <tr className="parent-account">
                              <td 
                                colSpan={2} 
                                className="border border-gray-300 p-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleGroup(group.parent.id)}
                              >
                                <div className="flex items-center">
                                  {expandedGroups.has(group.parent.id) ? (
                                    <ChevronDown size={16} className="mr-2" />
                                  ) : (
                                    <ChevronRight size={16} className="mr-2" />
                                  )}
                                  {group.parent.name}
                                  <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({group.children.length} sub-accounts)
                                  </span>
                                </div>
                              </td>
                            </tr>
                            
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
          </center>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">Total Accounts</div>
          <div className="text-2xl font-bold text-gray-900">{ledgerAccounts.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">Parent Accounts</div>
          <div className="text-2xl font-bold text-blue-600">
            {ledgerAccounts.filter(acc => !acc.parent_id).length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">Child Accounts</div>
          <div className="text-2xl font-bold text-green-600">
            {ledgerAccounts.filter(acc => acc.parent_id).length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-purple-600">
            {ledgerAccounts.filter(acc => acc.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">Groups</div>
          <div className="text-2xl font-bold text-orange-600">
            {getAccountsGroupedByParent().length}
          </div>
        </div>
      </div>
      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Nominal Ledger</h3>
        <p className="text-blue-700 text-sm">
          The nominal ledger provides a structured overview of all chart of accounts organized by financial statement categories. 
          This layout helps in understanding the account hierarchy and structure for financial reporting.
        </p>
      </div>

    </motion.div>
  );
};

export default NominalLedgerLayout;