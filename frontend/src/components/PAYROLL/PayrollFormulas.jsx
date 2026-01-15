import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

// Available payroll fields
const PAYROLL_FIELDS = [
  { value: 'rateNbc584', label: 'Basic Rate (NBC 584)', category: 'Salary' },
  { value: 'rateNbc594', label: 'Basic Rate (NBC 594)', category: 'Salary' },
  { value: 'nbc594', label: 'NBC 594', category: 'Salary' },
  { value: 'nbcDiffl597', label: 'NBC Adjustment', category: 'Salary' },
  { value: 'increment', label: 'Salary Increment', category: 'Salary' },
  { value: 'h', label: 'Hours Worked', category: 'Time' },
  { value: 'm', label: 'Minutes Worked', category: 'Time' },
  { value: 's', label: 'Seconds Worked', category: 'Time' },
  { value: 'gsisSalaryLoan', label: 'GSIS Salary Loan', category: 'Loans' },
  { value: 'gsisPolicyLoan', label: 'GSIS Policy Loan', category: 'Loans' },
  { value: 'gsisArrears', label: 'GSIS Arrears', category: 'Loans' },
  { value: 'cpl', label: 'CPL', category: 'Loans' },
  { value: 'mpl', label: 'MPL', category: 'Loans' },
  { value: 'eal', label: 'EAL', category: 'Loans' },
  { value: 'mplLite', label: 'MPL Lite', category: 'Loans' },
  { value: 'emergencyLoan', label: 'Emergency Loan', category: 'Loans' },
  {
    value: 'pagibigFundCont',
    label: 'Pag-IBIG Contribution',
    category: 'Government',
  },
  { value: 'pagibig2', label: 'Pag-IBIG 2', category: 'Government' },
  { value: 'multiPurpLoan', label: 'Multi-Purpose Loan', category: 'Loans' },
  { value: 'liquidatingCash', label: 'Liquidating Cash', category: 'Other' },
  {
    value: 'landbankSalaryLoan',
    label: 'Landbank Salary Loan',
    category: 'Loans',
  },
  { value: 'earistCreditCoop', label: 'EARIST Credit Coop', category: 'Other' },
  { value: 'feu', label: 'FEU', category: 'Other' },
  { value: 'withholdingTax', label: 'Withholding Tax', category: 'Government' },
  {
    value: 'PhilHealthContribution',
    label: 'PhilHealth',
    category: 'Government',
  },
  { value: 'ec', label: 'EC', category: 'Other' },
];

const CALCULATED_FIELDS = [
  { value: 'grossSalary', label: 'Gross Salary', category: 'Calculated' },
  { value: 'abs', label: 'Absence Deductions', category: 'Calculated' },
  { value: 'netSalary', label: 'Net Salary', category: 'Calculated' },
  {
    value: 'personalLifeRetIns',
    label: 'Personal Life Retirement Insurance',
    category: 'Calculated',
  },
  {
    value: 'totalGsisDeds',
    label: 'Total GSIS Deductions',
    category: 'Calculated',
  },
  {
    value: 'totalPagibigDeds',
    label: 'Total Pag-IBIG Deductions',
    category: 'Calculated',
  },
  {
    value: 'totalOtherDeds',
    label: 'Total Other Deductions',
    category: 'Calculated',
  },
  {
    value: 'totalDeductions',
    label: 'Total Deductions',
    category: 'Calculated',
  },
];

const OPERATORS = [
  { value: '+', label: 'Add', symbol: '+' },
  { value: '-', label: 'Subtract', symbol: '−' },
  { value: '*', label: 'Multiply', symbol: '×' },
  { value: '/', label: 'Divide', symbol: '÷' },
];

const FUNCTIONS = [
  { value: 'Math.floor', label: 'Round Down', description: 'Example: 3.7 → 3' },
  { value: 'Math.ceil', label: 'Round Up', description: 'Example: 3.2 → 4' },
  { value: 'Math.round', label: 'Round', description: 'Example: 3.5 → 4' },
];

const PERCENTAGES = [
  { label: '5%', value: '0.05' },
  { label: '9%', value: '0.09' },
  { label: '12%', value: '0.12' },
];

const PayrollFormulas = () => {
  const { settings } = useSystemSettings();
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [formulaName, setFormulaName] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');
  const [formulaInput, setFormulaInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [originalFormula, setOriginalFormula] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/payroll-formulas`,
        getAuthHeaders()
      );
      setFormulas(response.data);
    } catch (error) {
      console.error('Error fetching formulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFormulaForDisplay = (formula) => {
    if (!formula) return '';
    let simple = formula
      .replace(/parseFloat\s*\(/g, '')
      .replace(/parseFloat\(item\.(\w+)\s*\|\|\s*0\)/g, '$1')
      .replace(/parseFloat\((\w+)\s*\|\|\s*0\)/g, '$1')
      .replace(/parseFloat\(([^)]+)\)/g, '$1')
      .replace(/item\.(\w+)/g, '$1')
      .replace(/\s*\|\|\s*0/g, '')
      .replace(/Math\.floor/g, 'Round Down')
      .replace(/Math\.ceil/g, 'Round Up')
      .replace(/Math\.round/g, 'Round')
      .replace(/\?[^:]*:/g, '')
      .replace(/\?/g, '')
      .replace(/:/g, '')
      .replace(/\((\w+)\)/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*-\s*/g, ' - ')
      .replace(/\s*\*\s*/g, ' * ')
      .replace(/\s*\/\s*/g, ' / ')
      .trim();
    return simple;
  };

  const handleEdit = (formula) => {
    setEditingFormula(formula);
    setFormulaName(formula.formula_key);
    setFormulaDescription(formula.description || '');
    const simpleFormula = formatFormulaForDisplay(formula.formula_expression);
    setFormulaInput(simpleFormula);
    setOriginalFormula(simpleFormula);
    setOriginalDescription(formula.description || '');
    setVerificationChecked(false);
    setSelectedCategory('All');
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingFormula(null);
    setFormulaName('');
    setFormulaDescription('');
    setFormulaInput('');
    setOriginalFormula('');
    setOriginalDescription('');
    setVerificationChecked(false);
    setSelectedCategory('All');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const simpleExpression = formulaInput.trim();

      if (editingFormula) {
        await axios.put(
          `${API_BASE_URL}/api/payroll-formulas/${formulaName}`,
          {
            formula_expression: simpleExpression,
            description: formulaDescription,
          },
          getAuthHeaders()
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/payroll-formulas`,
          {
            formula_key: formulaName,
            formula_expression: simpleExpression,
            description: formulaDescription,
          },
          getAuthHeaders()
        );
      }
      await fetchFormulas();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving formula:', error);
      alert(error.response?.data?.error || 'Error saving formula');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formulaKey) => {
    if (window.confirm(`Are you sure you want to delete "${formulaKey}"?`)) {
      try {
        setLoading(true);
        await axios.delete(
          `${API_BASE_URL}/api/payroll-formulas/${formulaKey}`,
          getAuthHeaders()
        );
        await fetchFormulas();
      } catch (error) {
        console.error('Error deleting formula:', error);
        alert('Error deleting formula');
      } finally {
        setLoading(false);
      }
    }
  };

  const insertIntoFormula = (text) => {
    const current = formulaInput.trim();
    const newValue = current ? `${current} ${text}` : text;
    setFormulaInput(newValue);
  };

  const hasChanged =
    editingFormula &&
    (formulaInput !== originalFormula ||
      formulaDescription !== originalDescription);

  const categories = [
    'All',
    'Salary',
    'Time',
    'Loans',
    'Government',
    'Calculated',
    'Other',
  ];

  const allFields = [...PAYROLL_FIELDS, ...CALCULATED_FIELDS];
  const filteredFields =
    selectedCategory === 'All'
      ? allFields
      : allFields.filter((f) => f.category === selectedCategory);

  const filteredFormulas = formulas.filter(
    (formula) =>
      formula.formula_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (formula.description || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const paginatedFormulas = filteredFormulas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: settings.backgroundColor }}>
      {/* Header - Fixed */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${settings.accentColor} 0%, ${settings.backgroundColor} 100%)`,
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{ bgcolor: settings.primaryColor, width: 56, height: 56 }}
              >
                <CalculateIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: settings.textPrimaryColor }}
                >
                  Payroll Calculation Formulas
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: settings.textPrimaryColor, opacity: 0.8 }}
                >
                  Create and manage your payroll calculations
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchFormulas}
                disabled={loading}
                sx={{
                  borderColor: settings.primaryColor,
                  color: settings.textPrimaryColor,
                  '&:hover': {
                    borderColor: settings.secondaryColor,
                    bgcolor: alpha(settings.primaryColor, 0.1),
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  bgcolor: settings.primaryColor,
                  color: settings.accentColor,
                  '&:hover': { bgcolor: settings.secondaryColor },
                }}
              >
                New Formula
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Search - Fixed */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search formulas..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: settings.primaryColor }} />
            ),
          }}
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              bgcolor: settings.accentColor,
            },
          }}
        />
      </Box>

      {/* Table - Fixed */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: settings.primaryColor }} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(settings.primaryColor, 0.1) }}>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: settings.textPrimaryColor,
                      }}
                    >
                      Formula Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: settings.textPrimaryColor,
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: settings.textPrimaryColor,
                      }}
                    >
                      Calculation
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: settings.textPrimaryColor,
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFormulas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography
                          sx={{
                            color: settings.textPrimaryColor,
                            opacity: 0.7,
                          }}
                        >
                          {searchTerm
                            ? 'No formulas found'
                            : 'No formulas available. Create your first formula!'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFormulas.map((formula) => (
                      <TableRow
                        key={formula.id}
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(settings.primaryColor, 0.05),
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: settings.textPrimaryColor,
                          }}
                        >
                          {formula.formula_key}
                        </TableCell>
                        <TableCell sx={{ color: settings.textPrimaryColor }}>
                          {formula.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.9rem',
                              color: settings.textPrimaryColor,
                              maxWidth: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 500,
                            }}
                            title={formatFormulaForDisplay(
                              formula.formula_expression
                            )}
                          >
                            {formatFormulaForDisplay(
                              formula.formula_expression
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              justifyContent: 'center',
                            }}
                          >
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(formula)}
                                sx={{ color: settings.primaryColor }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDelete(formula.formula_key)
                                }
                                sx={{ color: '#d32f2f' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredFormulas.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: settings.primaryColor,
            color: settings.accentColor,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CalculateIcon />
          {editingFormula ? 'Edit Formula' : 'Create New Formula'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Basic Info */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Formula Name"
              value={formulaName}
              onChange={(e) => setFormulaName(e.target.value)}
              disabled={!!editingFormula}
              placeholder="e.g., grossSalary"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formulaDescription}
              onChange={(e) => setFormulaDescription(e.target.value)}
              placeholder="e.g., Calculate total salary before deductions"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Formula Builder */}
          <Box
            sx={{
              p: 3,
              bgcolor: alpha(settings.primaryColor, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(settings.primaryColor, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <HelpOutlineIcon sx={{ color: settings.primaryColor }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: settings.textPrimaryColor }}
              >
                Build Your Calculation
              </Typography>
            </Box>

            {/* Formula Input */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Type or Build Your Formula"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              placeholder="Type or click buttons below to build your formula..."
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                },
              }}
            />

            {/* Preview */}
            {formulaInput && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: alpha(settings.secondaryColor, 0.1),
                  border: `1px solid ${alpha(settings.secondaryColor, 0.3)}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  Preview:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    color: settings.secondaryColor,
                    fontSize: '0.9rem',
                  }}
                >
                  {formulaInput}
                </Typography>
              </Paper>
            )}

            {/* Quick Add Operations */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1.5 }}
              >
                Quick Add Operations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {OPERATORS.map((op) => (
                  <Button
                    key={op.value}
                    variant="contained"
                    onClick={() => insertIntoFormula(op.value)}
                    sx={{
                      minWidth: 50,
                      bgcolor: '#d32f2f',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#b71c1c' },
                    }}
                    title={op.label}
                  >
                    {op.symbol}
                  </Button>
                ))}
                {PERCENTAGES.map((pct) => (
                  <Button
                    key={pct.value}
                    variant="contained"
                    onClick={() => insertIntoFormula(`* ${pct.value}`)}
                    sx={{
                      bgcolor: '#f57c00',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#e65100' },
                    }}
                  >
                    {pct.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Category Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1.5 }}
              >
                Select Field Category
              </Typography>
              <ToggleButtonGroup
                value={selectedCategory}
                exclusive
                onChange={(e, value) => value && setSelectedCategory(value)}
                sx={{ flexWrap: 'wrap' }}
              >
                {categories.map((cat) => (
                  <ToggleButton
                    key={cat}
                    value={cat}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: settings.primaryColor,
                        color: settings.accentColor,
                        '&:hover': {
                          bgcolor: settings.secondaryColor,
                        },
                      },
                    }}
                  >
                    {cat}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Fields */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1.5 }}
              >
                Available Fields ({filteredFields.length})
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxHeight: 200,
                  overflowY: 'auto',
                  bgcolor: settings.accentColor,
                  border: `1px solid ${alpha(settings.primaryColor, 0.2)}`,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {filteredFields.map((field) => (
                    <Chip
                      key={field.value}
                      label={field.label}
                      onClick={() => insertIntoFormula(field.value)}
                      sx={{
                        bgcolor:
                          field.category === 'Calculated'
                            ? alpha(settings.secondaryColor, 0.2)
                            : alpha(settings.primaryColor, 0.1),
                        color: settings.textPrimaryColor,
                        border: `1px solid ${
                          field.category === 'Calculated'
                            ? settings.secondaryColor
                            : settings.primaryColor
                        }`,
                        '&:hover': {
                          bgcolor:
                            field.category === 'Calculated'
                              ? alpha(settings.secondaryColor, 0.3)
                              : alpha(settings.primaryColor, 0.2),
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Functions */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1.5 }}
              >
                Rounding Functions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {FUNCTIONS.map((func) => (
                  <Tooltip key={func.value} title={func.description}>
                    <Chip
                      label={func.label}
                      onClick={() => insertIntoFormula(`${func.value}(`)}
                      sx={{
                        bgcolor: alpha('#2e7d32', 0.1),
                        color: '#2e7d32',
                        border: '1px solid #2e7d32',
                        '&:hover': {
                          bgcolor: alpha('#2e7d32', 0.2),
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Verification */}
          {editingFormula && hasChanged && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: '#fff3cd',
                borderRadius: 2,
                border: '2px solid #ffc107',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationChecked}
                    onChange={(e) => setVerificationChecked(e.target.checked)}
                    sx={{
                      color: '#856404',
                      '&.Mui-checked': { color: '#856404' },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 'bold', color: '#856404' }}>
                    ✓ I confirm that I want to update this formula
                  </Typography>
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 2, bgcolor: alpha(settings.primaryColor, 0.05) }}
        >
          <Button
            variant="outlined"
            onClick={() => setShowModal(false)}
            startIcon={<CancelIcon />}
            sx={{
              borderColor: settings.primaryColor,
              color: settings.textPrimaryColor,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={
              loading ||
              !formulaName ||
              !formulaDescription ||
              !formulaInput ||
              (editingFormula && hasChanged && !verificationChecked)
            }
            sx={{
              bgcolor: settings.primaryColor,
              color: settings.accentColor,
              '&:hover': { bgcolor: settings.secondaryColor },
              '&:disabled': {
                bgcolor: alpha(settings.primaryColor, 0.3),
              },
            }}
          >
            {loading ? 'Saving...' : 'Save Formula'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollFormulas;
