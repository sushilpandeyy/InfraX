import React, { useState, useEffect } from 'react';
import { vishuApi } from '../api/brahma';

interface TerraformEditorProps {
  workflowId: string;
  initialCode?: string;
  onSave?: (code: string) => void;
  className?: string;
}

interface CodeVersion {
  version: number;
  modified_by: string;
  change_description: string;
  timestamp: string;
  code_length: number;
}

const TerraformEditor: React.FC<TerraformEditorProps> = ({
  workflowId,
  initialCode = '',
  onSave,
  className = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [originalCode, setOriginalCode] = useState(initialCode);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');

  // Enhanced tool states
  const [validating, setValidating] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [securityResult, setSecurityResult] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    setCode(initialCode);
    setOriginalCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setHasChanges(code !== originalCode);
  }, [code, originalCode]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/workflows/${workflowId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_id: workflowId,
          terraform_code: code,
          change_description: 'Manual code edit',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOriginalCode(code);
        setHasChanges(false);
        onSave?.(code);

        // Show success message
        alert('Code saved successfully!');
      } else {
        throw new Error(result.detail || 'Failed to save code');
      }
    } catch (error) {
      alert(`Error saving code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      setCode(originalCode);
      setHasChanges(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/workflows/${workflowId}/code/versions`);
      const result = await response.json();
      if (result.success) {
        setVersions(result.versions);
        setShowVersions(true);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const loadVersion = async (version: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/workflows/${workflowId}/code/versions/${version}`);
      const result = await response.json();
      if (result.success) {
        setCode(result.terraform_code);
        setShowVersions(false);
      }
    } catch (error) {
      console.error('Failed to load version:', error);
    }
  };

  const analyzeCode = async () => {
    setAnalyzing(true);
    try {
      const result = await vishuApi.analyzeWorkflow(workflowId);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze code:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSuggestions = async (focusArea: string) => {
    setLoadingSuggestions(true);
    setSelectedFocusArea(focusArea);
    try {
      const result = await vishuApi.getSuggestions(workflowId, focusArea);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Enhanced Tool Handlers
  const handleValidate = async () => {
    setValidating(true);
    try {
      const result = await vishuApi.validateSyntax(workflowId);
      setValidationResult(result);
      if (result.valid) {
        alert('✅ ' + result.message);
      } else {
        alert('❌ ' + result.message + '\n\nCheck the Vishu panel for details.');
      }
    } catch (error) {
      alert('Failed to validate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setValidating(false);
    }
  };

  const handleFormat = async () => {
    setFormatting(true);
    try {
      const result = await vishuApi.formatCode(workflowId);
      if (result.success && result.changes_made) {
        setCode(result.formatted_code);
        alert('🎨 Code formatted successfully!');
      } else {
        alert('ℹ️ Code is already properly formatted');
      }
    } catch (error) {
      alert('Failed to format: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setFormatting(false);
    }
  };

  const handleSecurityScan = async () => {
    setScanning(true);
    try {
      const result = await vishuApi.securityScan(workflowId);
      setSecurityResult(result);
      setSelectedFocusArea('security');
      const criticalCount = result.critical?.length || 0;
      const highCount = result.high?.length || 0;
      if (criticalCount > 0 || highCount > 0) {
        alert(`🔒 Security Scan Complete\n\n` +
          `Security Score: ${result.security_score}/100\n` +
          `Critical Issues: ${criticalCount}\n` +
          `High Issues: ${highCount}\n\n` +
          `Check Vishu panel for detailed report.`);
      } else {
        alert(`✅ Security scan passed!\nScore: ${result.security_score}/100`);
      }
    } catch (error) {
      alert('Failed to run security scan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setScanning(false);
    }
  };

  const handleAudit = async () => {
    setAuditing(true);
    try {
      const result = await vishuApi.comprehensiveAudit(workflowId);
      setAuditResult(result);
      setSelectedFocusArea('audit');
      alert(`📊 Comprehensive Audit Complete\n\n` +
        `Overall Grade: ${result.grade}\n` +
        `Score: ${result.overall_score}/100\n` +
        `Total Issues: ${result.total_issues}\n\n` +
        `Check Vishu panel for full report.`);
    } catch (error) {
      alert('Failed to run audit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="glass-card border-b border-blue-primary/30 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              💻 Terraform Editor
            </span>
            {hasChanges && (
              <span className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="text-xs px-3 py-2 rounded-lg glass border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
              title="Validate Terraform syntax"
            >
              {validating ? '⏳ Validating...' : '✅ Validate'}
            </button>
            <button
              onClick={handleFormat}
              disabled={formatting}
              className="text-xs px-3 py-2 rounded-lg glass border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
              title="Auto-format code"
            >
              {formatting ? '⏳ Formatting...' : '🎨 Format'}
            </button>
            <button
              onClick={handleSecurityScan}
              disabled={scanning}
              className="text-xs px-3 py-2 rounded-lg glass border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
              title="Security scan"
            >
              {scanning ? '⏳ Scanning...' : '🔒 Security'}
            </button>
            <button
              onClick={handleAudit}
              disabled={auditing}
              className="text-xs px-3 py-2 rounded-lg glass border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
              title="Comprehensive audit"
            >
              {auditing ? '⏳ Auditing...' : '📊 Audit'}
            </button>
            <button
              onClick={loadVersions}
              className="text-xs px-3 py-2 rounded-lg glass border border-blue-primary/30 text-gray-300 hover:bg-blue-primary/20 transition-all"
            >
              📜 History
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="text-xs px-3 py-2 rounded-lg glass border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↺ Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="text-xs px-4 py-2 rounded-lg bg-blue-primary hover:bg-blue-dark text-white font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-6 bg-gray-900/50 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none border-r border-blue-primary/20"
            style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            spellCheck={false}
          />

          <div className="glass-card border-t border-blue-primary/20 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
            <span>{code.split('\n').length} lines • {code.length} characters</span>
            <span>Terraform (.tf)</span>
          </div>
        </div>

        {/* Vishu Suggestions Panel */}
        <div className="w-96 glass-card border-l border-blue-primary/30 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-primary/20">
            <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
              <span>🤖</span>
              Vishu Suggestions
            </h3>
          </div>

          <div className="p-4 border-b border-blue-primary/20">
            <p className="text-xs text-gray-400 mb-3">Focus Area:</p>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'security', 'cost', 'performance'].map((area) => (
                <button
                  key={area}
                  onClick={() => getSuggestions(area)}
                  disabled={loadingSuggestions}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                    selectedFocusArea === area
                      ? 'bg-blue-primary/20 border-blue-primary/50 text-blue-light'
                      : 'glass border-blue-primary/30 text-gray-300 hover:bg-blue-primary/10'
                  } disabled:opacity-50`}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingSuggestions && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-primary"></div>
                <span>Getting suggestions...</span>
              </div>
            )}

            {/* Audit Results */}
            {selectedFocusArea === 'audit' && auditResult && auditResult.success && (
              <div className="space-y-4">
                <div className="glass p-4 rounded-xl border border-blue-primary/30">
                  <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                    Overall Grade: <span className={`${
                      auditResult.grade.startsWith('A') ? 'text-green-400' :
                      auditResult.grade === 'B' ? 'text-blue-400' :
                      auditResult.grade === 'C' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{auditResult.grade}</span>
                  </h4>
                  <p className="text-sm text-gray-400">Score: {auditResult.overall_score}/100</p>
                  <p className="text-sm text-gray-400">Total Issues: {auditResult.total_issues}</p>
                </div>

                {auditResult.security && (
                  <div className="glass p-4 rounded-xl border border-yellow-500/30">
                    <h5 className="text-sm font-bold text-yellow-400 mb-2">🔒 Security Score: {auditResult.security.security_score}/100</h5>
                    {auditResult.security.critical?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-red-400 font-semibold">Critical Issues ({auditResult.security.critical.length}):</p>
                        {auditResult.security.critical.slice(0, 3).map((issue: any, i: number) => (
                          <p key={i} className="text-xs text-gray-300 ml-2">• {issue.issue || JSON.stringify(issue)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {auditResult.validation && !auditResult.validation.valid && (
                  <div className="glass p-4 rounded-xl border border-red-500/30">
                    <h5 className="text-sm font-bold text-red-400 mb-2">❌ Validation Errors</h5>
                    {auditResult.validation.errors?.slice(0, 3).map((err: any, i: number) => (
                      <p key={i} className="text-xs text-gray-300">• {err.summary || JSON.stringify(err)}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Results */}
            {selectedFocusArea === 'security' && securityResult && securityResult.success && (
              <div className="space-y-4">
                <div className="glass p-4 rounded-xl border border-yellow-500/30">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">🔒 Security Score: {securityResult.security_score}/100</h4>
                  <p className="text-sm text-gray-400">Total Issues: {securityResult.total_issues}</p>
                </div>

                {securityResult.critical?.length > 0 && (
                  <div className="glass p-4 rounded-xl border border-red-500/30">
                    <h5 className="text-sm font-bold text-red-400 mb-2">CRITICAL ({securityResult.critical.length})</h5>
                    {securityResult.critical.map((issue: any, i: number) => (
                      <div key={i} className="mb-3 pb-3 border-b border-red-500/20 last:border-0">
                        <p className="text-xs text-red-300 font-semibold">{issue.issue}</p>
                        <p className="text-xs text-gray-400">Resource: {issue.resource}</p>
                        <p className="text-xs text-green-300 mt-1">Fix: {issue.fix}</p>
                      </div>
                    ))}
                  </div>
                )}

                {securityResult.high?.length > 0 && (
                  <div className="glass p-4 rounded-xl border border-orange-500/30">
                    <h5 className="text-sm font-bold text-orange-400 mb-2">HIGH ({securityResult.high.length})</h5>
                    {securityResult.high.slice(0, 5).map((issue: any, i: number) => (
                      <div key={i} className="mb-2">
                        <p className="text-xs text-gray-300">• {issue.issue}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Validation Results */}
            {validationResult && validationResult.success && selectedFocusArea === 'validation' && (
              <div className="space-y-4">
                {validationResult.valid ? (
                  <div className="glass p-4 rounded-xl border border-green-500/30">
                    <h4 className="text-lg font-bold text-green-400">✅ Syntax Valid!</h4>
                    <p className="text-sm text-gray-400 mt-2">{validationResult.message}</p>
                  </div>
                ) : (
                  <div className="glass p-4 rounded-xl border border-red-500/30">
                    <h4 className="text-lg font-bold text-red-400 mb-2">❌ Syntax Errors</h4>
                    {validationResult.errors?.map((err: any, i: number) => (
                      <div key={i} className="mb-2 pb-2 border-b border-red-500/20 last:border-0">
                        <p className="text-xs text-red-300">{err.summary}</p>
                        {err.detail && <p className="text-xs text-gray-400 mt-1">{err.detail}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regular Suggestions */}
            {suggestions && suggestions.success && !['audit', 'security', 'validation'].includes(selectedFocusArea) && (
              <div className="space-y-4">
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {suggestions.suggestions}
                </div>
              </div>
            )}

            {analysis && analysis.success && !suggestions && !auditResult && !securityResult && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Code Analysis</h4>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.analysis}
                </div>
              </div>
            )}

            {!suggestions && !analysis && !loadingSuggestions && !auditResult && !securityResult && !validationResult && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p>Use the tools above to analyze,</p>
                <p>validate, and improve your code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card border border-blue-primary/30 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-blue-primary/20 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                📜 Version History
              </h3>
              <button
                onClick={() => setShowVersions(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No version history yet</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.version}
                      className="glass p-4 rounded-xl border border-blue-primary/20 hover:border-blue-primary/40 transition-all cursor-pointer"
                      onClick={() => loadVersion(version.version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-blue-light">
                          Version {version.version}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          version.modified_by === 'vishu'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {version.modified_by === 'vishu' ? '🤖 Vishu' : '👤 User'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{version.change_description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatTimestamp(version.timestamp)}</span>
                        <span>•</span>
                        <span>{version.code_length} chars</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerraformEditor;
