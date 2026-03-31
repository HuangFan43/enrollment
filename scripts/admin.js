/**
 * 招生管理后台 - 脚本
 */

const API_BASE = '/api';

// 全局数据
let allSubmissions = [];

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadStats();
    loadSubmissions();
});

// ========== 导航 ==========
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 切换导航
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 切换页面
            const pageId = this.dataset.page;
            showPage(pageId);
        });
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// ========== 数据加载 ==========
async function loadStats() {
    try {
        const response = await fetch(API_BASE + '/stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('stat-total').textContent = result.data.total;
            document.getElementById('stat-today').textContent = result.data.today;
        }
    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

async function loadSubmissions() {
    try {
        const response = await fetch(API_BASE + '/submissions');
        const result = await response.json();
        
        if (result.success) {
            allSubmissions = result.data;
            renderRecentTable();
            renderFullTable();
            
            // 更新统计
            const guardianCount = allSubmissions.reduce((sum, s) => {
                return sum + (s.guardians ? s.guardians.length : 0);
            }, 0);
            document.getElementById('stat-guardians').textContent = guardianCount;
        }
    } catch (error) {
        console.error('加载报名记录失败:', error);
    }
}

// ========== 表格渲染 ==========
function renderRecentTable() {
    const tbody = document.querySelector('#recent-table tbody');
    if (!tbody) return;
    
    if (allSubmissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无报名数据</td></tr>';
        return;
    }
    
    const recent = allSubmissions.slice(0, 5);
    tbody.innerHTML = recent.map(s => `
        <tr>
            <td>${escapeHtml(s.studentName)}</td>
            <td>${s.idCard}</td>
            <td>${s.guardians ? s.guardians.map(g => g.name).join(', ') : '-'}</td>
            <td>${formatDate(s.createdAt)}</td>
        </tr>
    `).join('');
}

function renderFullTable() {
    const tbody = document.querySelector('#submissions-table tbody');
    if (!tbody) return;
    
    if (allSubmissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无报名数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = allSubmissions.map(s => `
        <tr>
            <td>${s.id.substring(0, 8)}...</td>
            <td>${escapeHtml(s.studentName)}</td>
            <td>${s.idCard}</td>
            <td>${s.guardians && s.guardians[0] ? escapeHtml(s.guardians[0].name) + '<br>' + escapeHtml(s.guardians[0].phone) : '-'}</td>
            <td>${s.guardians && s.guardians[1] ? escapeHtml(s.guardians[1].name) + '<br>' + escapeHtml(s.guardians[1].phone) : '-'}</td>
            <td>${formatDate(s.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSubmission('${s.id}')">删除</button>
            </td>
        </tr>
    `).join('');
}

// ========== 删除 ==========
async function deleteSubmission(id) {
    if (!confirm('确定要删除这条报名记录吗？')) return;
    
    try {
        const response = await fetch(API_BASE + '/submissions/' + id, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            alert('删除成功');
            loadStats();
            loadSubmissions();
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试');
    }
}

// ========== 导出 ==========
function exportData(format) {
    if (allSubmissions.length === 0) {
        alert('暂无数据可导出');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'csv') {
        content = toCSV(allSubmissions);
        filename = 'enrollment_data_' + getDateString() + '.csv';
        mimeType = 'text/csv;charset=utf-8;';
    } else {
        content = JSON.stringify(allSubmissions, null, 2);
        filename = 'enrollment_data_' + getDateString() + '.json';
        mimeType = 'application/json;charset=utf-8;';
    }
    
    // 显示预览
    const preview = document.getElementById('export-preview');
    if (preview) {
        preview.textContent = content.substring(0, 2000) + (content.length > 2000 ? '\n...(数据已截断)' : '');
    }
    
    // 下载文件
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function toCSV(data) {
    const headers = ['ID', '学生姓名', '身份证号', '监护人1姓名', '监护人1手机', '监护人1工作单位', '监护人2姓名', '监护人2手机', '监护人2工作单位', '报名时间'];
    const rows = data.map(s => {
        const g1 = s.guardians ? s.guardians[0] : {};
        const g2 = s.guardians ? s.guardians[1] : {};
        return [
            s.id,
            s.studentName,
            s.idCard,
            g1.name || '',
            g1.phone || '',
            g1.workplace || '',
            g2.name || '',
            g2.phone || '',
            g2.workplace || '',
            s.createdAt
        ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
    });
    
    return '\ufeff' + [headers.join(','), ...rows].join('\n');
}

// ========== 工具函数 ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDateString() {
    const now = new Date();
    return now.getFullYear() + '-' + 
           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
           String(now.getDate()).padStart(2, '0');
}