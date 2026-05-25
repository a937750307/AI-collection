// 打字机效果状态
let typingInterval = null;
let currentModelIndex = 0;
let isLocked = false;

// 自动飞出展示相关
let flyoutInterval = null;
let currentFlyoutItem = null;
let isFlyingOut = false;
let lastFlyoutSide = null; // 记录上次飞出的方向

// 初始化粒子效果
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            animation-delay: ${Math.random() * 20}s;
            animation-duration: ${Math.random() * 10 + 15}s;
        `;
        container.appendChild(particle);
    }

    // 初始化左右两侧浮动光点
    initFloatingDots();
}

// 初始化左右两侧浮动光点
function initFloatingDots() {
    const leftContainer = document.getElementById('floatingDotsLeft');
    const rightContainer = document.getElementById('floatingDotsRight');
    
    const createDots = (container, count) => {
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'floating-dot';
            dot.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 8}s;
                animation-duration: ${6 + Math.random() * 4}s;
            `;
            container.appendChild(dot);
        }
    };
    
    createDots(leftContainer, 15);
    createDots(rightContainer, 15);
}

// 打字机效果
function typeWriter(text, element, speed = 100) {
    return new Promise((resolve) => {
        // 1. 【重要】如果元素没找到，直接 resolve，防止后续报错
        if (!element) {
            //console.warn("TypeWriter Error: Element not found");
            resolve();
            return;
        }

        let i = 0;
        // 此时 element 肯定存在，可以直接赋值
        element.textContent = "";

        if (typingInterval) {
            clearInterval(typingInterval);
        }

        typingInterval = setInterval(() => {
            if (i < text.length) {
                // 2. 这里直接使用 element 是安全的，因为上面已经检查过了
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                resolve();
            }
        }, speed);
    });
}

// 显示模型信息到中心
async function showModelInCenter(model, lock = false) {
    if (lock) {
        isLocked = true;
    }
    
    const centerIcon = document.getElementById('centerIcon');
    const centerTitle = document.getElementById('centerTitle');
    const centerDesc = document.getElementById('centerDesc');
    const centerBtn = document.getElementById('centerBtn');
    const typingText = centerTitle.querySelector('.typing-text');
    
    // 显示图标
    centerIcon.src = model.icon;
    centerIcon.style.display = 'block';
    
    // 打字机效果显示名称
    await typeWriter(model.name, typingText, 80);
    
    // 显示描述和按钮
    centerDesc.textContent = model.desc;
    centerBtn.href = model.url;
    centerBtn.classList.add('visible');
}

// 恢复默认状态
function resetCenter() {
    isLocked = false;
    
    const centerIcon = document.getElementById('centerIcon');
    const centerTitle = document.getElementById('centerTitle');
    const centerDesc = document.getElementById('centerDesc');
    const centerBtn = document.getElementById('centerBtn');
    const typingText = centerTitle.querySelector('.typing-text');
    
    // 隐藏图标和按钮
    centerIcon.style.display = 'none';
    centerBtn.classList.remove('visible');
    
    // 清除打字机
    if (typingInterval) {
        clearInterval(typingInterval);
    }
    
    // 恢复默认文字
    typingText.textContent = '';
    centerDesc.textContent = '';
    
    // 开始循环打字
    startTypingLoop();
}

// 循环打字效果
async function startTypingLoop() {
    if (isLocked) return;
    
    const centerTitle = document.getElementById('centerTitle');
    const centerDesc = document.getElementById('centerDesc');
    const typingText = centerTitle.querySelector('.typing-text');
    
    const defaultTexts = [
        { title: '让 AI 为你', desc: '探索人工智能的无限可能' },
        { title: '生成未来', desc: '聚合 500+ 全球顶尖大模型' },
        { title: '智能对话', desc: 'GPT-4 / Claude / Gemini / 文心一言' },
        { title: '图像创作', desc: 'Midjourney / DALL-E / Stable Diffusion' },
        { title: '视频生成', desc: 'Sora / 可灵 / Runway / Pika' }
    ];
    
    while (!isLocked) {
        const text = defaultTexts[currentModelIndex % defaultTexts.length];
        
        // 打字标题
        await typeWriter(text.title, typingText, 120);
        centerDesc.textContent = text.desc;
        
        // 等待2秒
        await new Promise(r => setTimeout(r, 2000));
        
        // 删除文字
        if (!isLocked) {
            await deleteText(typingText);
            centerDesc.textContent = '';
        }
        
        currentModelIndex++;
    }
}

// 删除文字效果
function deleteText(element) {
    return new Promise((resolve) => {
        let text = element.textContent;
        
        const deleteInterval = setInterval(() => {
            if (text.length > 0 && !isLocked) {
                text = text.slice(0, -1);
                element.textContent = text;
            } else {
                clearInterval(deleteInterval);
                resolve();
            }
        }, 50);
    });
}

// 初始化轨道 - 从HTML读取模型数据并定位
function initOrbit() {
    const orbitOuter = document.getElementById('orbitOuter');
    const orbitInner = document.getElementById('orbitInner');
    const centerContent = document.getElementById('centerContent');

    // 1. 【核心修复】检查关键容器是否存在
    if (!orbitOuter) {
        console.error("initOrbit Error: #orbitOuter 元素未找到");
        return; // 直接退出函数，防止报错
    }
    if (!orbitInner) {
        console.error("initOrbit Error: #orbitInner 元素未找到");
        return;
    }
    if (!centerContent) {
        console.error("initOrbit Error: #centerContent 元素未找到");
        return;
    }

    // --- 以下代码保持不变 ---

    // 获取外环模型并定位
    const outerItems = orbitOuter.querySelectorAll('.orbit-item');
    const outerRadius = 370; // 外环半径减去偏移
    outerItems.forEach((item, index) => {
        const angle = (index / outerItems.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * outerRadius;
        const y = Math.sin(angle) * outerRadius;

        // 保存原始位置供飞出后返回
        item.dataset.originLeft = `calc(50% + ${x}px - 16px)`;
        item.dataset.originTop = `calc(50% + ${y}px - 16px)`;
        item.dataset.ring = 'outer';
        item.dataset.index = index;

        item.style.left = item.dataset.originLeft;
        item.style.top = item.dataset.originTop;

        // 获取模型数据
        const model = {
            name: item.dataset.name||'',
            desc: item.dataset.desc||'',
            url: item.dataset.url||'',
            icon: item.querySelector('.orbit-icon')?.src || '/static/images/default-avatar.png'
        };

        // 绑定事件
        item.addEventListener('mouseenter', () => {
            if (!isLocked && !isFlyingOut) {
                showModelInCenter(model, false);
            }
        });

        item.addEventListener('mouseleave', () => {
            if (!isLocked && !isFlyingOut) {
                resetCenter();
            }
        });

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            showModelInCenter(model, true);
        });
    });

    // 获取内环模型并定位
    const innerItems = orbitInner.querySelectorAll('.orbit-item');
    const innerRadius = 245; // 内环半径减去偏移
    innerItems.forEach((item, index) => {
        const angle = (index / innerItems.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * innerRadius;
        const y = Math.sin(angle) * innerRadius;

        // 保存原始位置供飞出后返回
        item.dataset.originLeft = `calc(50% + ${x}px - 16px)`;
        item.dataset.originTop = `calc(50% + ${y}px - 16px)`;
        item.dataset.ring = 'inner';
        item.dataset.index = index;

        item.style.left = item.dataset.originLeft;
        item.style.top = item.dataset.originTop;

        // 获取模型数据
        const model = {
            name: item.dataset.name||'CC',
            desc: item.dataset.desc||'DD',
            url: item.dataset.url||'SS',
            icon: item.querySelector('.orbit-icon')?.src || '/static/images/default-avatar.png'
        };

        // 绑定事件
        item.addEventListener('mouseenter', () => {
            if (!isLocked && !isFlyingOut) {
                showModelInCenter(model, false);
            }
        });

        item.addEventListener('mouseleave', () => {
            if (!isLocked && !isFlyingOut) {
                resetCenter();
            }
        });

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            showModelInCenter(model, true);
        });
    });

    // 鼠标悬停时暂停轨道动画
    orbitOuter.addEventListener('mouseenter', () => {
        if (!isLocked) orbitOuter.style.animationPlayState = 'paused';
    });
    orbitOuter.addEventListener('mouseleave', () => {
        orbitOuter.style.animationPlayState = 'running';
    });

    orbitInner.addEventListener('mouseenter', () => {
        if (!isLocked) orbitInner.style.animationPlayState = 'paused';
    });
    orbitInner.addEventListener('mouseleave', () => {
        orbitInner.style.animationPlayState = 'running';
    });

    // 点击中心内容区域不恢复默认
    centerContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 点击其他地方恢复默认
    document.addEventListener('click', (e) => {
        if (isLocked && !e.target.closest('.orbit-item') && !e.target.closest('.center-content')) {
            resetCenter();
        }
    });
}

// 页面加载动画
function initLoadAnimation() {
    document.body.style.opacity = '0';

    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';

        // 开始打字循环
        setTimeout(startTypingLoop, 500);
    }, 100);
}

// 键盘快捷键
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const orbitOuter = document.getElementById('orbitOuter');
        const orbitInner = document.getElementById('orbitInner');

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                const isPaused = orbitOuter.style.animationPlayState === 'paused';
                orbitOuter.style.animationPlayState = isPaused ? 'running' : 'paused';
                orbitInner.style.animationPlayState = isPaused ? 'running' : 'paused';
                break;
            case 'Escape':
                if (isLocked) {
                    resetCenter();
                }
                break;
        }
    });
}

// 初始化
function init() {
    initParticles();
    initOrbit();
    initLoadAnimation();
    initKeyboardShortcuts();
    initFullscreen();
    startAutoFlyout();
}

// 全屏功能
function initFullscreen() {
    const btn = document.getElementById('fullscreenBtn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            // 进入全屏
            document.documentElement.requestFullscreen().catch(err => {
                console.log('全屏失败:', err);
            });
        } else {
            // 退出全屏
            document.exitFullscreen();
        }
    });
    
    // 监听全屏状态变化，更新按钮图标
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
            `;
            btn.title = '退出全屏';
        } else {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
            `;
            btn.title = '全屏模式';
        }
    });
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ========== 自动飞出展示功能 ==========
// 随机选择一个图标飞出到左右两侧展示

function startAutoFlyout() {
    // 每 4 秒执行一次飞出
    flyoutInterval = setInterval(() => {
        if (!isLocked && !isFlyingOut) {
            autoFlyoutRandom();
        }
    }, 4000);
}

function autoFlyoutRandom() {
    const orbitOuter = document.getElementById('orbitOuter');
    const orbitInner = document.getElementById('orbitInner');
    
    // 合并所有图标
    const allItems = [
        ...orbitOuter.querySelectorAll('.orbit-item'),
        ...orbitInner.querySelectorAll('.orbit-item')
    ];
    
    if (allItems.length === 0) return;
    
    // 随机选择一个
    const randomIndex = Math.floor(Math.random() * allItems.length);
    const item = allItems[randomIndex];
    
    // 左右交替飞出：如果上次是左边，这次就右边，反之亦然
    const flyToRight = lastFlyoutSide === 'left';
    lastFlyoutSide = flyToRight ? 'right' : 'left';
    
    // 执行飞出
    flyoutItem(item, flyToRight);
}

function flyoutItem(item, toRight) {
    if (isFlyingOut || isLocked) return;
    isFlyingOut = true;
    currentFlyoutItem = item;
    
    // 不暂停轨道旋转，让它继续转
    
    // 获取模型信息
    const model = {
        name: item.dataset.name||'',
        desc: item.dataset.desc||'',
        url: item.dataset.url||window.location.origin,
        icon: item.querySelector('.orbit-icon')?.src||'/static/images/default-avatar.png'
    };
    
    // 计算飞出目标位置
    const targetX = toRight ? 
        window.innerWidth - 180 :  // 右侧
        100;                        // 左侧
    const targetY = 200 + Math.random() * 250; // 随机高度
    
    // 添加飞出动画类
    item.classList.add('flyout-active');
    
    // 设置飞出位置
    item.style.left = `${targetX}px`;
    item.style.top = `${targetY}px`;
    item.style.zIndex = '999999';
    
    // 显示展开的内容卡片
    showFlyoutCard(item, model, toRight, targetX, targetY);
}

function showFlyoutCard(item, model, toRight, x, y) {
    // 创建飞出卡片
    const card = document.createElement('div');
    card.className = 'flyout-card';
    card.innerHTML = `
        <div class="flyout-card-inner">
            <img class="flyout-card-icon" src="${model.icon}" alt="${model.name}">
            <div class="flyout-card-content">
                <h3 class="flyout-card-title">${model.name}</h3>
                <p class="flyout-card-desc">${model.desc}</p>
                <a class="flyout-card-btn" href="${model.url}" target="_blank">
                    立即体验
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>
    `;
    
    // 定位卡片
    card.style.left = `${x + (toRight ? -280 : 60)}px`;
    card.style.top = `${y - 40}px`;
    
    document.body.appendChild(card);
    
    // 触发动画
    requestAnimationFrame(() => {
        card.classList.add('visible');
    });
    
    // 3秒后收回
    setTimeout(() => {
        returnItem(item, card);
    }, 3500);
}

function returnItem(item, card) {
    // 移除卡片
    card.classList.remove('visible');
    setTimeout(() => card.remove(), 500);
    
    // 返回原位
    item.style.left = item.dataset.originLeft;
    item.style.top = item.dataset.originTop;
    item.style.zIndex = '';
    
    setTimeout(() => {
        item.classList.remove('flyout-active');
        isFlyingOut = false;
        currentFlyoutItem = null;
        // 不恢复轨道旋转，因为它一直在转
    }, 600);
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeModal = document.getElementById('closeModal');
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = document.querySelectorAll('.auth-form');
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');

    // 底部登录注册按钮
    const footerLogin = document.getElementById('footerLogin');
    const footerRegister = document.getElementById('footerRegister');

    // 打开登录
    loginBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        switchTab('login');
    });

    // 打开注册
    registerBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        switchTab('register');
    });

    // 底部打开登录
    footerLogin.addEventListener('click', () => {
        modal.style.display = 'flex';
        switchTab('login');
    });

    // 底部打开注册
    footerRegister.addEventListener('click', () => {
        modal.style.display = 'flex';
        switchTab('register');
    });

    // 关闭弹窗
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.style.display = 'none';
    });

    // 切换标签
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // 文字切换
    toRegister.addEventListener('click', () => switchTab('register'));
    toLogin.addEventListener('click', () => switchTab('login'));

    // 切换方法
    function switchTab(tabName) {
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        document.querySelector(`.modal-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    // 表单提交（可对接后端）
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        //alert('登录功能已触发，可对接后端接口');
        //modal.style.display = 'none';
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        //alert('注册功能已触发，可对接后端接口');
        //modal.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
     const logoutBtn = document.getElementById('logoutBtn');
     const logoutBtns = document.getElementById('logoutBtns');
    if (logoutBtn) { // 只有元素存在时才绑定事件
        logoutBtn.addEventListener('click', function () {
            layer.confirm('确定要退出登录吗？', {
                icon: 3,
                title: '系统提示'
            }, function () {
                $.ajax({
                    url: '/logout',
                    type: 'POST',
                    dataType: 'json',
                    success: function (res) {
                        if (res.code === 1) {
                            layer.msg('退出登录成功', { icon: 1 });
                            setTimeout(() => {
                                location.href = '/';
                            }, 1000);
                        } else {
                            layer.msg('退出失败', { icon: 2 });
                        }
                    },
                    error: function() {
                        layer.msg('请求失败，请重试', { icon: 2 });
                    }
                });
            });
        });
    }


     if (logoutBtns) { // 只有元素存在时才绑定事件
        logoutBtns.addEventListener('click', function () {
            layer.confirm('确定要退出登录吗？', {
                icon: 3,
                title: '系统提示'
            }, function () {
                $.ajax({
                    url: '/logout',
                    type: 'POST',
                    dataType: 'json',
                    success: function (res) {
                        if (res.code === 1) {
                            layer.msg('退出登录成功', { icon: 1 });
                            setTimeout(() => {
                                location.href = '/';
                            }, 1000);
                        } else {
                            layer.msg('退出失败', { icon: 2 });
                        }
                    },
                    error: function() {
                        layer.msg('请求失败，请重试', { icon: 2 });
                    }
                });
            });
        });
    }
});

$(function () {
    // ======================================
    // 登录提交
    // ======================================
    $("#loginForm").submit(function (e) {
        e.preventDefault(); // 阻止默认刷新

        let btn = $(this).find(".auth-btn");
        let oldText = btn.text();
        btn.text("登录中...").prop("disabled", true);

        $.ajax({
            url: "/login",
            type: "POST",
            data: $(this).serialize(),
            dataType: "json",
            success: function (res) {
                if (res.code === 1) {
                    layer.msg("登录成功", {
    icon: 1,
    skin: 'custom-dark-msg', // 自定义样式类
    time: 2000,
    offset: 'auto'
});
					setTimeout(() => {
                        location.reload();
                    }, 1000);
                    
                } else {
                    layer.msg(res.msg || "登录失败", {
    icon: 2,
    skin: 'custom-dark-msg', // 自定义样式类
    time: 2000,
    offset: 'auto'
});
                    // 刷新验证码
                    $(".captcha-img").click();
                }
            },
            error: function () {
                layer.alert("服务器异常，请稍后重试");
            },
            complete: function () {
                btn.text(oldText).prop("disabled", false);
            }
        });
    });

    // ======================================
    // 注册提交
    // ======================================
    $("#registerForm").submit(function (e) {
        e.preventDefault();

        let btn = $(this).find(".auth-btn");
        let oldText = btn.text();
        btn.text("注册中...").prop("disabled", true);

        let password = $(this).find("input[name=password]").val();
        let repassword = $(this).find("input[name=repassword]").val();

        // 前端验证两次密码一致
        if (password !== repassword) {
            layer.msg("两次密码输入不一致", {
    icon: 2,
    skin: 'custom-dark-msg', // 自定义样式类
    time: 2000,
    offset: 'auto'
});
            btn.text(oldText).prop("disabled", false);
            return;
        }

        $.ajax({
            url: "/register",
            type: "POST",
            data: $(this).serialize(),
            dataType: "json",
            success: function (res) {
                if (res.code === 1) {
                    layer.msg("注册成功，请登录", {
    icon: 1,
    skin: 'custom-dark-msg', // 自定义样式类
    time: 2000,
    offset: 'auto'
});
                    // 切换到登录
					switchTab('login');
                    $(".modal-tab[data-tab=login]").click();
                    // 清空表单
                    $("#registerForm")[0].reset();
                } else {
                    layer.msg(res.msg || "注册失败", {
    icon: 2,
    skin: 'custom-dark-msg', // 自定义样式类
    time: 2000,
    offset: 'auto'
});
                    $(".captcha-img").click();
                }
            },
            error: function () {
                layer.alert("服务器异常，请稍后重试");
            },
            complete: function () {
                btn.text(oldText).prop("disabled", false);
            }
        });
    });
	
	
	    function switchTab(tabName) {
		const tabs = document.querySelectorAll('.modal-tab');
		const forms = document.querySelectorAll('.auth-form');
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        document.querySelector(`.modal-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }
});