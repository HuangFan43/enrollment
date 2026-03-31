/**
 * 招生信息填报系统 - 后端服务
 * REST API + 数据持久化
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

// 中间件
app.use(cors());
app.use(express.json());

// 读取数据
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { submissions: [] };
    }
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ========== API 路由 ==========

// 获取所有报名记录（管理员用）
app.get('/api/submissions', (req, res) => {
    const data = readData();
    // 返回时脱敏身份证号
    const safeSubmissions = data.submissions.map(s => ({
        id: s.id,
        studentName: s.studentName,
        idCard: s.idCard ? s.idCard.substring(0, 3) + '**********' + s.idCard.slice(-4) : '',
        guardians: s.guardians,
        createdAt: s.createdAt
    }));
    res.json({ success: true, data: safeSubmissions, total: safeSubmissions.length });
});

// 提交报名信息
app.post('/api/submissions', (req, res) => {
    const { studentName, idCard, guardians } = req.body;

    // 简单验证
    if (!studentName || !idCard || !guardians || !Array.isArray(guardians)) {
        return res.status(400).json({ 
            success: false, 
            message: '缺少必要字段' 
        });
    }

    // 验证身份证格式
    if (idCard.length !== 18) {
        return res.status(400).json({ 
            success: false, 
            message: '身份证号码格式不正确' 
        });
    }

    // 验证监护人
    for (const g of guardians) {
        if (!g.name || !g.phone) {
            return res.status(400).json({ 
                success: false, 
                message: '监护人姓名和手机号必填' 
            });
        }
    }

    const data = readData();

    // 生成唯一 ID
    const newSubmission = {
        id: uuidv4(),
        studentName,
        idCard, // 实际存储完整身份证，生产环境应加密
        guardians: guardians.map(g => ({
            name: g.name,
            phone: g.phone,
            workplace: g.workplace || ''
        })),
        createdAt: new Date().toISOString()
    };

    data.submissions.unshift(newSubmission); // 最新提交放在最前面
    writeData(data);

    res.status(201).json({ 
        success: true, 
        message: '提交成功',
        id: newSubmission.id 
    });
});

// 根据 ID 查询报名信息
app.get('/api/submissions/:id', (req, res) => {
    const data = readData();
    const submission = data.submissions.find(s => s.id === req.params.id);
    
    if (!submission) {
        return res.status(404).json({ 
            success: false, 
            message: '未找到该报名记录' 
        });
    }

    // 脱敏返回
    res.json({
        success: true,
        data: {
            id: submission.id,
            studentName: submission.studentName,
            idCard: submission.idCard ? submission.idCard.substring(0, 3) + '**********' + submission.idCard.slice(-4) : '',
            guardians: submission.guardians,
            createdAt: submission.createdAt
        }
    });
});

// 删除报名记录
app.delete('/api/submissions/:id', (req, res) => {
    const data = readData();
    const index = data.submissions.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ 
            success: false, 
            message: '未找到该报名记录' 
        });
    }

    data.submissions.splice(index, 1);
    writeData(data);

    res.json({ success: true, message: '删除成功' });
});

// 统计信息
app.get('/api/stats', (req, res) => {
    const data = readData();
    res.json({
        success: true,
        data: {
            total: data.submissions.length,
            today: data.submissions.filter(s => {
                const today = new Date().toISOString().split('T')[0];
                return s.createdAt.startsWith(today);
            }).length
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🎓 招生系统后端服务已启动: http://localhost:${PORT}`);
    console.log(`📋 API 端点:`);
    console.log(`   GET  /api/submissions - 获取所有报名记录`);
    console.log(`   POST /api/submissions - 提交报名信息`);
    console.log(`   GET  /api/submissions/:id - 查询单个报名`);
    console.log(`   DELETE /api/submissions/:id - 删除报名记录`);
    console.log(`   GET  /api/stats - 统计信息`);
});