-- Insert missing parent accounts
INSERT INTO charts_of_accounts (code, name, type, parent_id) VALUES
('00300', 'SAVINGS', 'liability', NULL),
('00200', 'CURRENT', 'liability', NULL),
('00400', 'SUSU', 'liability', NULL),
('00500', 'CASH', 'asset', NULL),
('70000', 'LOANS', 'asset', NULL),
('10300', 'INTERESTS', 'income', NULL),
('10400', 'COMMISSIONS', 'income', NULL),
('30000', 'BUSINESS EXPENSES', 'expense', NULL),
('46000', 'OPERATING EXPENSES', 'expense', NULL),
('45000', 'FIXED ASSETS', 'asset', NULL),
('47000', 'INVESTMENTS', 'asset', NULL),
('99999', 'OTHERS', 'expense', NULL);


INSERT INTO charts_of_accounts (code, name, type, parent_id)
SELECT * FROM (
    -- SAVINGS sub-accounts (Parent: 00300)
    SELECT '00301', 'SAVINGS ACCOUNT', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00300') UNION ALL
    SELECT '00302', 'SHARES ACCOUNT', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00300') UNION ALL
    SELECT '00303', 'PENSION ACCOUNT', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00300') UNION ALL -- Fixed duplicate '00201'
    SELECT '00203', 'YOUTH SAVINGS (MEBA DAAKYE)', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00300') UNION ALL
    SELECT '00305', 'EDUCATION POLICY (MEBA SUKUU NTI)', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00300') UNION ALL -- Fixed duplicate '45000'
    
    -- CURRENT sub-accounts (Parent: 00200)
    SELECT '00202', 'SPECIAL INVESTMENT', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00200') UNION ALL
    
    -- SUSU sub-accounts (Parent: 00400)
    SELECT '00401', 'SUSU SAVINGS', 'liability', (SELECT id FROM charts_of_accounts WHERE code = '00400') UNION ALL
    
    -- CASH sub-accounts (Parent: 00500)
    SELECT '00501', 'Cash', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '00500') UNION ALL
    
    -- LOANS sub-accounts (Parent: 70000)
    SELECT '70004', 'Regular Loan', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '70000') UNION ALL -- Fixed duplicate '70000'
    SELECT '70001', 'Susu Loan', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '70000') UNION ALL
    SELECT '70002', 'Staff Loan', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '70000') UNION ALL
    SELECT '70003', 'Emergency Loan', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '70000') UNION ALL
    
    -- INTERESTS sub-accounts (Parent: 10300)
    SELECT '10301', 'INTEREST ON LOANS', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10300') UNION ALL
    SELECT '10302', 'Interest of investments', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10300') UNION ALL
    
    -- COMMISSIONS sub-accounts (Parent: 10400)
    SELECT '10401', 'Loan processing fees', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10400') UNION ALL
    SELECT '10402', 'PASSBOOK', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10400') UNION ALL
    SELECT '10403', 'ENTRANCE FEES', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10400') UNION ALL
    SELECT '10404', 'LOAN FORMS', 'income', (SELECT id FROM charts_of_accounts WHERE code = '10400') UNION ALL
    
    -- BUSINESS EXPENSES sub-accounts (Parent: 30000)
    SELECT '30001', 'HONORARIUM', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '30000') UNION ALL -- Fixed duplicate '30000'
    SELECT '47006', 'STAFF CLOTH AND T-SHIRT', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '30000') UNION ALL
    SELECT '47008', 'EDUCATION AND TRAINING', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '30000') UNION ALL
    
    -- OPERATING EXPENSES sub-accounts (Parent: 46000)
    SELECT '46001', 'PRINTING AND STATIONARY', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46002', 'COMISSION TO STAFF', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46003', 'COMMUNICATION', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '10001', 'SALARIES', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46004', 'TRANSPORTATION', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46005', 'SNNIT', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46006', 'REPAIRS AND MAINTENANCE', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46007', 'UTILITIES', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46008', 'REFRESHMENT', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46009', 'DONATION', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46010', 'OFFICE EXPENSES', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46011', 'NETWORKING', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '46012', 'INTEREST ON DEPOSITS', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    SELECT '42005', 'CLEANING AND SANITATION', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '46000') UNION ALL
    
    -- FIXED ASSETS sub-accounts (Parent: 45000)
    SELECT '45001', 'FURNITURE', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    SELECT '45002', 'COMPUTERS', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    SELECT '45003', 'FAN', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    SELECT '45004', 'CUA SOFTWARE', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    SELECT '45005', 'AIR CONDITION', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    SELECT '45006', 'CUA LICENCE', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '45000') UNION ALL
    
    -- INVESTMENTS sub-accounts (Parent: 47000)
    SELECT '47001', 'Investa Capital fund Management', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    SELECT '47002', 'Utrak Capital Fund Management', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    SELECT '47003', 'GN Bank', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    SELECT '47004', 'Bosomtwe Rural Bank', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    SELECT '47005', 'MOBILE MONEY', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    SELECT '47007', 'GHANA COMMERCIAL BANK', 'asset', (SELECT id FROM charts_of_accounts WHERE code = '47000') UNION ALL
    
    -- OTHERS sub-accounts (Parent: 99999)
    SELECT '99998', 'STATIONERY', 'expense', (SELECT id FROM charts_of_accounts WHERE code = '99999') -- Fixed duplicate '46001'
) AS new_accounts;