import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { authStore } from '../../store/auth.store';
import Chart from 'chart.js/auto';
import Layout from '../../components/layout/Layout';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authStore.getUser();
  
  const doctorChartRef = useRef(null);
  const opdStatusChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const registrationsChartRef = useRef(null);
  
  const doctorChartInstance = useRef(null);
  const opdStatusChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);
  const registrationsChartInstance = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/dashboard');
        setDashboardData(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!dashboardData) return;

    // Destroy existing charts
    if (doctorChartInstance.current) doctorChartInstance.current.destroy();
    if (opdStatusChartInstance.current) opdStatusChartInstance.current.destroy();
    if (revenueChartInstance.current) revenueChartInstance.current.destroy();
    if (registrationsChartInstance.current) registrationsChartInstance.current.destroy();

    // OPD by Doctor Chart
    if (doctorChartRef.current && dashboardData.opd?.doctors_today) {
      const doctors = dashboardData.opd.doctors_today.slice(0, 5); // Top 5
      doctorChartInstance.current = new Chart(doctorChartRef.current, {
        type: 'bar',
        data: {
          labels: doctors.map(d => d.name || 'Unknown'),
          datasets: [{
            label: 'Patients Today',
            data: doctors.map(d => d.visit_count || 0),
            backgroundColor: '#0f6b63'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: { display: true, text: 'OPD Load by Doctor (Today)' }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    }

    // OPD Status Breakdown Chart
    if (opdStatusChartRef.current && dashboardData.opd?.status_breakdown) {
      const statuses = dashboardData.opd.status_breakdown;
      opdStatusChartInstance.current = new Chart(opdStatusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: statuses.map(s => s.status),
          datasets: [{
            data: statuses.map(s => s.count || 0),
            backgroundColor: ['#28a745', '#ffc107', '#007bff', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'OPD Queue Status' }
          }
        }
      });
    }

    // Revenue Trend Chart (Last 7 Days)
    if (revenueChartRef.current && dashboardData.trends?.billing) {
      const billing = dashboardData.trends.billing.slice(0, 7).reverse();
      revenueChartInstance.current = new Chart(revenueChartRef.current, {
        type: 'line',
        data: {
          labels: billing.map(b => {
            const date = new Date(b.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }),
          datasets: [{
            label: 'Revenue (₹)',
            data: billing.map(b => b.amount || 0),
            borderColor: '#0f6b63',
            backgroundColor: 'rgba(15, 107, 99, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: { display: true, text: 'Revenue Trend (Last 7 Days)' }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: {
                callback: value => '₹' + value.toLocaleString()
              }
            }
          }
        }
      });
    }

    // Registrations Trend Chart
    if (registrationsChartRef.current && dashboardData.trends?.registrations) {
      const registrations = dashboardData.trends.registrations.slice(0, 7).reverse();
      registrationsChartInstance.current = new Chart(registrationsChartRef.current, {
        type: 'line',
        data: {
          labels: registrations.map(r => {
            const date = new Date(r.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }),
          datasets: [{
            label: 'New Registrations',
            data: registrations.map(r => r.registrations || 0),
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: { display: true, text: 'Patient Registrations (Last 7 Days)' }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (doctorChartInstance.current) doctorChartInstance.current.destroy();
      if (opdStatusChartInstance.current) opdStatusChartInstance.current.destroy();
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (registrationsChartInstance.current) registrationsChartInstance.current.destroy();
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div className="loading-message">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">No dashboard data available</div>
        </div>
      </Layout>
    );
  }

  const kpis = dashboardData.overview?.kpis || {};
  const systemStats = dashboardData.overview?.system_stats || {};
  const opd = dashboardData.opd || {};
  const billing = dashboardData.billing || {};

  return (
    <Layout>
      <div className="container">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <p className="welcome-text">Welcome, {user?.username || 'User'}</p>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi">
            <h3>Registrations Today</h3>
            <div className="value">{kpis.registrations?.today || 0}</div>
            <div className="kpi-sub">Total: {kpis.registrations?.total || 0}</div>
          </div>
          <div className="kpi">
            <h3>OPD Visits Today</h3>
            <div className="value">{kpis.opd_visits?.today || 0}</div>
            <div className="kpi-sub">Total: {kpis.opd_visits?.total || 0}</div>
          </div>
          <div className="kpi">
            <h3>Revenue Today</h3>
            <div className="value">₹{(kpis.billing?.today_amount || 0).toLocaleString()}</div>
            <div className="kpi-sub">{kpis.billing?.today_bills || 0} bills</div>
          </div>
          <div className="kpi">
            <h3>Active Doctors</h3>
            <div className="value">{systemStats.active_doctors || 0}</div>
            <div className="kpi-sub">{systemStats.total_patients || 0} patients</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="section">
          <div className="card">
            <div className="chart-box">
              <canvas ref={doctorChartRef}></canvas>
            </div>
          </div>

          <div className="card">
            <div className="chart-box">
              <canvas ref={opdStatusChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="section">
          <div className="card">
            <div className="chart-box">
              <canvas ref={revenueChartRef}></canvas>
            </div>
          </div>

          <div className="card">
            <div className="chart-box">
              <canvas ref={registrationsChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="section">
          <div className="card">
            <h4>Top Villages by Patient Count</h4>
            <ul className="info-list">
              {dashboardData.demographics?.slice(0, 5).map((demo, idx) => (
                <li key={idx}>
                  <span>{demo.village || 'Unknown'}</span>
                  <strong>{demo.count || 0}</strong>
                </li>
              ))}
              {(!dashboardData.demographics || dashboardData.demographics.length === 0) && (
                <li className="no-data">No village data available</li>
              )}
            </ul>
          </div>

          <div className="card">
            <h4>System Stats</h4>
            <ul className="info-list">
              <li>
                <span>Total Patients</span>
                <strong>{systemStats.total_patients || 0}</strong>
              </li>
              <li>
                <span>Total OPD Visits</span>
                <strong>{systemStats.total_opd_visits || 0}</strong>
              </li>
              <li>
                <span>Total Consultations</span>
                <strong>{systemStats.total_consultations || 0}</strong>
              </li>
              <li>
                <span>Total Bills</span>
                <strong>{systemStats.total_bills || 0}</strong>
              </li>
              <li>
                <span>Active Users</span>
                <strong>{systemStats.active_users || 0}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer">
          <p>Dashboard data refreshed at: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </Layout>
  );
}
