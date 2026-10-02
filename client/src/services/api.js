const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(url, options = {}) {
  const token = sessionStorage.getItem('codenovaAdminToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(`${API_BASE}${url}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ===== Student =====
export const registerStudent = (data) =>
  request('/students/register', { method: 'POST', body: data });

export const studentLogin = (rollNumber, password) =>
  request('/students/login', { method: 'POST', body: { rollNumber, password } });

export const verifyStudent = (rollNumber) =>
  request('/students/verify', { method: 'POST', body: { rollNumber } });

export const updateStudent = (id, data) =>
  request(`/students/${id}`, { method: 'PUT', body: data });

// ===== Assessment =====
export const startAssessment = (studentId, skill, questionIds) =>
  request('/assessments/start', { method: 'POST', body: { studentId, skill, questionIds } });

export const saveProgress = (assessmentId, data) =>
  request(`/assessments/${assessmentId}/save`, { method: 'PUT', body: data });

export const submitAssessment = (assessmentId) =>
  request(`/assessments/${assessmentId}/submit`, { method: 'POST' });

export const getAssessment = (assessmentId) =>
  request(`/assessments/${assessmentId}`);

export const reportTabSwitch = (assessmentId) =>
  request(`/assessments/${assessmentId}/tab-switch`, { method: 'POST' });

// ===== Code Execution =====
export const executeCode = (sourceCode, languageId, stdin, questionId = null, assessmentId = null, questionIndex = null) =>
  request('/execute', { method: 'POST', body: {
    sourceCode, languageId, stdin,
    ...(questionId ? { questionId } : {}),
    ...(assessmentId ? { assessmentId } : {}),
    ...(Number.isInteger(questionIndex) ? { questionIndex } : {})
  } });

// ===== Questions =====
export const getQuestions = (skill) =>
  request(`/questions/${skill}`);

// ===== Admin =====
export const adminLogin = (name, email, password) =>
  request('/admin/login', { method: 'POST', body: { name, email, password } });

export const createAdmin = (data) =>
  request('/admin/admins', { method: 'POST', body: data });

export const getDashboardStats = () =>
  request('/admin/dashboard');

export const getAllStudents = (params = '') =>
  request(`/admin/students?${params}`);

export const getStudentJourney = (id) =>
  request(`/admin/students/${id}/journey`);

export const deleteStudent = (id) =>
  request(`/admin/students/${id}`, { method: 'DELETE' });

export const getRankings = (params = '') =>
  request(`/admin/rankings?${params}`);

// ===== Question Management =====
export const getAllQuestions = (params = '') =>
  request(`/admin/questions?${params}`);

export const addQuestion = (data) =>
  request('/admin/questions', { method: 'POST', body: data });

export const updateQuestion = (id, data) =>
  request(`/admin/questions/${id}`, { method: 'PUT', body: data });

export const deleteQuestion = (id) =>
  request(`/admin/questions/${id}`, { method: 'DELETE' });

// ===== AI =====
export const getStudentAnalysis = (id) =>
  request(`/ai/student/${id}/analysis`);

export const getTrainingPlan = (id) =>
  request(`/ai/student/${id}/training-plan`);

export const getDepartmentAnalysis = () =>
  request('/ai/department/analysis');

export const generateAiQuestions = (data) =>
  request('/ai/generate-questions', { method: 'POST', body: data });

// ===== Export =====
export const exportStudents = () =>
  `${API_BASE}/admin/students/export`;
