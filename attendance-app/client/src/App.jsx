import React, { useState, useEffect } from 'react';
import { BookOpen, PieChart, FileText, Lock, ChevronRight, UserCheck, X, Minus, Download, ArrowRight } from 'lucide-react';
import { getGrades, getSections, getAttendance, saveAttendance, getDailyReport, getDailyStats, checkHealth } from './api';

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, sections, attendance, stats, report
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    checkHealth().then(res => {
      setIsOnline(!!res);
    });
  }, []);

  const navigateTo = (newView, grade = null, section = null) => {
    setView(newView);
    if (grade) setSelectedGrade(grade);
    if (section) setSelectedSection(section);
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="top-nav">
        <div className="nav-actions">
          <button className="btn btn-report" onClick={() => navigateTo('report')}>
            <FileText size={18} /> التقرير
          </button>
          <button className="btn btn-stats" onClick={() => navigateTo('stats')}>
            <PieChart size={18} /> الإحصائية
          </button>
        </div>
        
        <div className="school-title">
          <div className={`status-badge ${isOnline ? '' : 'error'}`}>
            <div className="status-dot"></div>
            {isOnline ? 'متصل (البيانات متزامنة)' : 'غير متصل بالخادم'}
          </div>
          <Lock size={20} color="#7f8c8d" />
          مدرستي - حضور وغياب المتعلمات
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main>
        {view === 'dashboard' && <Dashboard onSelectGrade={(g) => navigateTo('sections', g)} />}
        
        {view === 'sections' && (
          <SectionSelect 
            grade={selectedGrade} 
            onBack={() => navigateTo('dashboard')}
            onSelectSection={(s) => navigateTo('attendance', selectedGrade, s)} 
          />
        )}
        
        {view === 'attendance' && (
          <AttendanceView 
            section={selectedSection}
            grade={selectedGrade}
            date={date}
            setDate={setDate}
            onBack={() => navigateTo('sections', selectedGrade)}
          />
        )}
        
        {view === 'stats' && <StatsView date={date} setDate={setDate} onBack={() => navigateTo('dashboard')} />}
        
        {view === 'report' && <ReportView date={date} setDate={setDate} onBack={() => navigateTo('dashboard')} />}
      </main>
    </div>
  );
}

function Dashboard({ onSelectGrade }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGrades().then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div>
      <h2 className="dashboard-title">الصفوف الدراسية</h2>
      <div className="grades-grid">
        {grades.map(grade => (
          <div 
            key={grade.id} 
            className={`grade-card grade-${grade.color}`}
            onClick={() => onSelectGrade(grade)}
          >
            <BookOpen size={48} />
            {grade.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionSelect({ grade, onBack, onSelectSection }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (grade) {
      getSections(grade.id).then(data => {
        setSections(data);
        setLoading(false);
      });
    }
  }, [grade]);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          {grade.name} <ChevronRight size={18} /> اختيار الفصل
        </div>
        <button className="btn btn-back" onClick={onBack}>
          <ArrowRight size={18} /> رجوع
        </button>
      </div>

      <div className="sections-list">
        {sections.map(section => (
          <div key={section.id} className="section-item" onClick={() => onSelectSection(section)}>
            {section.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceView({ section, grade, date, setDate, onBack }) {
  const [data, setData] = useState({ periods: [], students: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (section && date) {
      setLoading(true);
      getAttendance(section.id, date).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [section, date]);

  // Helper to find existing record status
  const getStatus = (studentId, periodId) => {
    const record = data.attendance.find(a => a.student_id === studentId && a.period_id === periodId);
    return record ? record.status : 'none'; // default is gray minus "unmarked" like reference
  };

  const cycleStatus = async (studentId, periodId, currentStatus) => {
    // Current statuses cycle: none(gray -) -> present(green check) -> absent(red cross) -> none
    const statusMap = {
      'none': 'present',
      'present': 'absent',
      'absent': 'none'
    };
    const newStatus = statusMap[currentStatus] || 'present';

    // Optimistic UI update
    const updatedData = { ...data };
    const idx = updatedData.attendance.findIndex(a => a.student_id === studentId && a.period_id === periodId);
    
    if (idx >= 0) {
      updatedData.attendance[idx].status = newStatus;
    } else {
      updatedData.attendance.push({ student_id: studentId, period_id: periodId, status: newStatus });
    }
    setData(updatedData);

    // Save to backend
    try {
      await saveAttendance({
        student_id: studentId,
        period_id: periodId,
        date: date,
        status: newStatus
      });
    } catch (err) {
      console.error('Failed to save', err);
      // in real app we might revert optimistic update here
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <button className="btn btn-back" style={{padding: '5px 10px', marginLeft: 10}} onClick={onBack}>
            <ArrowRight size={16} />
          </button>
          {grade.name} - {section.name}
        </div>
        <input 
          type="date" 
          className="date-picker" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="loading">جاري تحميل سجل الحضور...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>اسم الطالبة</th>
                {data.periods.map(p => (
                  <th key={p.id} className="period-header">
                    الحصة {p.period_num}
                    <span className="teacher-name"><Lock size={10}/> {p.teachers?.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map(student => (
                <tr key={student.id}>
                  <td className="student-name">{student.name}</td>
                  {data.periods.map(period => {
                    const status = getStatus(student.id, period.id);
                    return (
                      <td key={period.id} className="cell-center">
                        <div 
                          className={`status-icon status-${status}`}
                          onClick={() => cycleStatus(student.id, period.id, status)}
                        >
                          {status === 'present' && <UserCheck size={18} />}
                          {status === 'none' && <Minus size={18} />}
                          {status === 'absent' && <X size={18} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatsView({ date, setDate, onBack }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDailyStats(date).then(res => {
      setStats(res);
      setLoading(false);
    });
  }, [date]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">الإحصائية اليومية</div>
        <div className="header-actions">
          <input type="date" className="date-picker" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-export" onClick={handlePrint}>
            <Download size={18} /> تحميل PDF
          </button>
          <button className="btn btn-back" onClick={onBack}>رجوع</button>
        </div>
      </div>

      {loading ? <div className="loading">جاري التحميل...</div> : (
        <div id="pdf-content" className="stats-grid">
          {stats.map(s => (
            <div key={s.gradeId} className="stat-card" style={{borderTopColor: `var(--${s.gradeColor})`}}>
              <div className="stat-header">
                {s.gradeName}
              </div>
              <div className="stat-row">
                <span className="stat-label">المقيد</span>
                <span className="stat-value">{s.total}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">الحضور</span>
                <span className="stat-value" style={{color: 'var(--present)'}}>{s.presentCount} ({s.presentPercent}%)</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">الغياب</span>
                <span className="stat-value" style={{color: 'var(--late)'}}>{s.absentCount} ({s.absentPercent}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportView({ date, setDate, onBack }) {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDailyReport(date).then(res => {
      setReport(res);
      setLoading(false);
    });
  }, [date]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">تقرير الغياب اليومي</div>
        <div className="header-actions">
          <input type="date" className="date-picker" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-export" onClick={handlePrint}>
            <Download size={18} /> تحميل PDF للطباعة
          </button>
          <button className="btn btn-back" onClick={onBack}>رجوع</button>
        </div>
      </div>

      {loading ? <div className="loading">جاري التحميل...</div> : (
        <div className="table-container" id="pdf-content">
          <table>
            <thead>
              <tr>
                <th>الصف</th>
                <th>الفصل</th>
                <th>اسم الطالبة</th>
                <th>الحصص المتغيب عنها</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr><td colSpan="5" className="cell-center" style={{padding: 30}}>لا يوجد غياب مسجل لهذا اليوم</td></tr>
              ) : report.map((row, i) => (
                <tr key={i}>
                  <td>{row.gradeName}</td>
                  <td>{row.sectionName}</td>
                  <td className="student-name">{row.studentName}</td>
                  <td style={{direction: 'ltr', textAlign: 'right'}}>{row.missedPeriods.join(', ')}</td>
                  <td>
                    {row.status === 'absent' ? 'غياب' : 'تأخير'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
