import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import StudentLogin from './pages/StudentLogin'
import StudentRegistration from './pages/StudentRegistration'
import StudentDetails from './pages/StudentDetails'
import GeneralRules from './pages/GeneralRules'
import SkillSelection from './pages/SkillSelection'
import CodingTest from './pages/CodingTest'
import FinalSubmission from './pages/FinalSubmission'
import StudentResult from './pages/StudentResult'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import StudentManagement from './pages/StudentManagement'
import QuestionManagement from './pages/QuestionManagement'
import StudentJourney from './pages/StudentJourney'
import Rankings from './pages/Rankings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Student Flow */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegistration />} />
        <Route path="/student/details" element={<StudentDetails />} />
        <Route path="/student/rules" element={<GeneralRules />} />
        <Route path="/student/select-skill" element={<SkillSelection />} />
        <Route path="/student/test" element={<CodingTest />} />
        <Route path="/student/submit" element={<FinalSubmission />} />
        <Route path="/student/result" element={<StudentResult />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/questions" element={<QuestionManagement />} />
        <Route path="/admin/students/:id/journey" element={<StudentJourney />} />
        <Route path="/admin/rankings" element={<Rankings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
