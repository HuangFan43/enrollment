/**
 * 学校招生信息填报系统 - JavaScript
 * 功能：表单验证、动态添加监护人、提交处理
 */

(function() {
    'use strict';

    // ========== 常量配置 ==========
    const CONFIG = {
        ID_CARD_REGEX: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
        PHONE_REGEX: /^1[3-9]\d{9}$/,
        NAME_REGEX: /^[\u4e00-\u9fa5a-zA-Z]{2,20}$/,
        MAX_GUARDIANS: 2
    };

    // ========== DOM 元素 ==========
    const form = document.getElementById('enrollment-form');
    const addGuardianBtn = document.getElementById('add-guardian-btn');
    const resetBtn = document.getElementById('reset-btn');
    const submitBtn = document.getElementById('submit-btn');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let guardianCount = 1;

    // ========== 初始化 ==========
    document.addEventListener('DOMContentLoaded', function() {
        initEventListeners();
        initLocalStorage();
    });

    // ========== 事件监听 ==========
    function initEventListeners() {
        // 添加监护人
        addGuardianBtn.addEventListener('click', addGuardian);

        // 删除监护人（事件委托）
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remove-guardian')) {
                removeGuardian(parseInt(e.target.dataset.index));
            }
        });

        // 重置表单
        resetBtn.addEventListener('click', resetForm);

        // 提交表单
        form.addEventListener('submit', handleSubmit);

        // 实时验证输入
        initRealTimeValidation();

        // 关闭弹窗
        modalCloseBtn.addEventListener('click', closeModal);
        successModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }

    // ========== 实时验证 ==========
    function initRealTimeValidation() {
        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            // 失去焦点时验证
            input.addEventListener('blur', function() {
                validateField(this);
            });

            // 输入时清除错误状态
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    clearError(this.id);
                }
            });
        });
    }

    // ========== 添加监护人 ==========
    function addGuardian() {
        if (guardianCount >= CONFIG.MAX_GUARDIANS) {
            return;
        }

        guardianCount++;
        const guardian2Section = document.getElementById('guardian2-section');
        guardian2Section.classList.remove('hidden');
        addGuardianBtn.classList.add('hidden');

        // 更新按钮文本
        addGuardianBtn.textContent = '已添加两名监护人';
        addGuardianBtn.disabled = true;
    }

    // ========== 删除监护人 ==========
    function removeGuardian(index) {
        if (index !== 2) return;

        const guardian2Section = document.getElementById('guardian2-section');
        
        // 清空监护人2的数据
        const inputs = guardian2Section.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        // 清除错误消息
        const errors = guardian2Section.querySelectorAll('.error-message');
        errors.forEach(error => error.textContent = '');

        // 隐藏监护人2
        guardian2Section.classList.add('hidden');
        
        // 恢复添加按钮
        addGuardianBtn.classList.remove('hidden');
        addGuardianBtn.textContent = '+ 添加监护人';
        addGuardianBtn.disabled = false;

        guardianCount = 1;

        // 重新验证（如果需要）
        validateForm();
    }

    // ========== 表单验证 ==========
    function validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        // 学生姓名验证
        if (fieldName === 'studentName') {
            if (!value) {
                isValid = false;
                errorMessage = '请输入学生姓名';
            } else if (!CONFIG.NAME_REGEX.test(value)) {
                isValid = false;
                errorMessage = '姓名长度为2-20个字符';
            }
        }

        // 身份证验证
        if (fieldName === 'idCard') {
            if (!value) {
                isValid = false;
                errorMessage = '请输入身份证号码';
            } else if (!validateIdCard(value)) {
                isValid = false;
                errorMessage = '请输入有效的18位身份证号码';
            }
        }

        // 监护人姓名验证
        if (fieldName.includes('Name')) {
            if (!value) {
                isValid = false;
                errorMessage = '请输入监护人姓名';
            } else if (!CONFIG.NAME_REGEX.test(value)) {
                isValid = false;
                errorMessage = '姓名长度为2-20个字符';
            }
        }

        // 手机号验证
        if (fieldName.includes('Phone')) {
            if (!value) {
                isValid = false;
                errorMessage = '请输入手机号码';
            } else if (!CONFIG.PHONE_REGEX.test(value)) {
                isValid = false;
                errorMessage = '请输入有效的11位手机号码';
            }
        }

        // 更新 UI
        if (!isValid) {
            input.classList.add('error');
            showError(input.id, errorMessage);
        } else {
            input.classList.remove('error');
            clearError(input.id);
        }

        return isValid;
    }

    // ========== 身份证校验 ==========
    function validateIdCard(idCard) {
        if (!CONFIG.ID_CARD_REGEX.test(idCard)) {
            return false;
        }

        // 校验位验证
        const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        const checkCode = '10X98765432';
        
        const sum = idCard.split('').slice(0, 17)
            .reduce((acc, val, i) => acc + parseInt(val) * weight[i], 0);
        
        return checkCode[sum % 11] === idCard[17].toUpperCase();
    }

    // ========== 显示错误 ==========
    function showError(inputId, message) {
        const errorElement = document.getElementById(inputId + '-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // ========== 清除错误 ==========
    function clearError(inputId) {
        const errorElement = document.getElementById(inputId + '-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // ========== 表单验证 ==========
    function validateForm() {
        const inputs = form.querySelectorAll('.form-input[required], .guardian-name[required], .guardian-phone[required]');
        let isValid = true;

        inputs.forEach(input => {
            // 跳过隐藏的监护人2的字段
            if (input.closest('#guardian2-section')?.classList.contains('hidden')) {
                return;
            }
            
            if (!validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // ========== 提交处理 ==========
    function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            // 滚动到第一个错误
            const firstError = form.querySelector('.form-input.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // 收集表单数据
        const formData = {
            studentName: document.getElementById('student-name').value.trim(),
            idCard: document.getElementById('id-card').value.trim(),
            guardians: [
                {
                    name: document.getElementById('guardian1-name').value.trim(),
                    phone: document.getElementById('guardian1-phone').value.trim(),
                    workplace: document.getElementById('guardian1-workplace').value.trim()
                }
            ]
        };

        // 如果有第二个监护人
        const guardian2Section = document.getElementById('guardian2-section');
        if (!guardian2Section.classList.contains('hidden')) {
            formData.guardians.push({
                name: document.getElementById('guardian2-name').value.trim(),
                phone: document.getElementById('guardian2-phone').value.trim(),
                workplace: document.getElementById('guardian2-workplace').value.trim()
            });
        }

        // 显示加载状态
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // 调用后端 API
        fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(result => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;

            if (result.success) {
                // 显示成功弹窗
                showSuccessModal();
                
                // 清空表单
                form.reset();
                resetGuardians();
                
                // 清除 localStorage
                localStorage.removeItem('enrollmentForm');
            } else {
                alert('提交失败：' + (result.message || '请重试'));
            }
        })
        .catch(error => {
            console.error('提交失败:', error);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            alert('提交失败，请检查网络连接后重试');
        });
    }

    // ========== 显示成功弹窗 ==========
    function showSuccessModal() {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // ========== 关闭弹窗 ==========
    function closeModal() {
        successModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ========== 重置表单 ==========
    function resetForm() {
        if (confirm('确定要清空所有已填写的信息吗？')) {
            form.reset();
            resetGuardians();
            
            // 清除所有错误状态
            const errorInputs = form.querySelectorAll('.form-input.error');
            errorInputs.forEach(input => input.classList.remove('error'));
            
            const errorMessages = form.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.textContent = '');
            
            // 清除 localStorage
            localStorage.removeItem('enrollmentForm');
        }
    }

    // ========== 重置监护人状态 ==========
    function resetGuardians() {
        guardianCount = 1;
        const guardian2Section = document.getElementById('guardian2-section');
        guardian2Section.classList.add('hidden');
        
        addGuardianBtn.classList.remove('hidden');
        addGuardianBtn.textContent = '+ 添加监护人';
        addGuardianBtn.disabled = false;
    }

    // ========== LocalStorage ==========
    function initLocalStorage() {
        const savedData = localStorage.getItem('enrollmentForm');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // 填充表单数据
                if (data.studentName) document.getElementById('student-name').value = data.studentName;
                if (data.idCard) document.getElementById('id-card').value = data.idCard;
                if (data.guardian1Name) document.getElementById('guardian1-name').value = data.guardian1Name;
                if (data.guardian1Phone) document.getElementById('guardian1-phone').value = data.guardian1Phone;
                if (data.guardian1Workplace) document.getElementById('guardian1-workplace').value = data.guardian1Workplace;
                
                // 如果有第二个监护人
                if (data.guardian2Name) {
                    addGuardian();
                    if (data.guardian2Name) document.getElementById('guardian2-name').value = data.guardian2Name;
                    if (data.guardian2Phone) document.getElementById('guardian2-phone').value = data.guardian2Phone;
                    if (data.guardian2Workplace) document.getElementById('guardian2-workplace').value = data.guardian2Workplace;
                }
            } catch (e) {
                console.error('Failed to load saved form data:', e);
            }
        }
    }

    function saveToLocalStorage() {
        const formData = {
            studentName: document.getElementById('student-name').value,
            idCard: document.getElementById('id-card').value,
            guardian1Name: document.getElementById('guardian1-name').value,
            guardian1Phone: document.getElementById('guardian1-phone').value,
            guardian1Workplace: document.getElementById('guardian1-workplace').value,
        };

        // 如果监护人2可见
        const guardian2Section = document.getElementById('guardian2-section');
        if (!guardian2Section.classList.contains('hidden')) {
            formData.guardian2Name = document.getElementById('guardian2-name').value;
            formData.guardian2Phone = document.getElementById('guardian2-phone').value;
            formData.guardian2Workplace = document.getElementById('guardian2-workplace').value;
        }

        localStorage.setItem('enrollmentForm', JSON.stringify(formData));
    }

})();