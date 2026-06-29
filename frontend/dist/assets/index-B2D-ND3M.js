(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();const L="http://localhost:5050/api",E={async request(t,a,e=null){const i=`${L}${a}`,s=localStorage.getItem("token"),r={"Content-Type":"application/json"};s&&(r.Authorization=`Bearer ${s}`);const o={method:t,headers:r};e&&(o.body=JSON.stringify(e));try{const n=await fetch(i,o),l=await n.json();if(!n.ok)throw n.status===401&&window.app&&typeof window.app.handleUserLogout=="function"&&window.app.handleUserLogout(),new Error(l.error||`HTTP error! status: ${n.status}`);return l}catch(n){throw console.error(`API Error on ${t} ${a}:`,n),n}},getTasks(t={}){const a=new URLSearchParams;Object.keys(t).forEach(s=>{t[s]!==void 0&&t[s]!==null&&t[s]!==""&&a.append(s,t[s])});const e=a.toString(),i=e?`/tasks?${e}`:"/tasks";return this.request("GET",i)},getTask(t){return this.request("GET",`/tasks/${t}`)},createTask(t){return this.request("POST","/tasks",t)},updateTask(t,a){return this.request("PUT",`/tasks/${t}`,a)},deleteTask(t){return this.request("DELETE",`/tasks/${t}`)},logTime(t,a,e){return this.request("POST",`/tasks/${t}/log-time`,{minutes:a,user_id:e})},getCategories(){return this.request("GET","/categories")},createCategory(t){return this.request("POST","/categories",t)},deleteCategory(t){return this.request("DELETE",`/categories/${t}`)},getUsers(){return this.request("GET","/users")},createUser(t){return this.request("POST","/users",t)},postComment(t,a){return this.request("POST",`/tasks/${t}/comments`,a)},getStats(){return this.request("GET","/dashboard/stats")},getActivityLogs(){return this.request("GET","/activity-logs")},exportData(){return this.request("GET","/system/export")},importData(t){return this.request("POST","/system/import",t)},register(t){return this.request("POST","/auth/register",t)},login(t){return this.request("POST","/auth/login",t)},guestLogin(){return this.request("POST","/auth/guest-login")},getProfile(){return this.request("GET","/auth/profile")},logout(){return this.request("POST","/auth/logout")}};window.API=E;const S={formatMinutes(t){if(!t||isNaN(t)||t<=0)return"0m";const a=Math.floor(t/60),e=t%60;return a===0?`${e}m`:e===0?`${a}h`:`${a}h ${e}m`},formatDate(t){if(!t)return"No due date";const a=new Date(t);return isNaN(a.getTime())?t:a.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},isOverdue(t){if(!t)return!1;const a=new Date;a.setHours(0,0,0,0);const e=new Date(t);return e.setHours(0,0,0,0),e<a},showToast(t,a="info"){const e=document.getElementById("notification-toast");if(!e)return;e.style.borderColor=a==="error"?"var(--priority-urgent)":"var(--primary)",e.style.boxShadow=a==="error"?"0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(235, 87, 87, 0.3)":"0 10px 30px rgba(0,0,0,0.5), 0 0 15px var(--primary-glow)";const i=a==="error"?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';e.innerHTML=`${i} <span>${t}</span>`,e.classList.remove("hidden"),this.toastTimeout&&clearTimeout(this.toastTimeout),this.toastTimeout=setTimeout(()=>{e.classList.add("hidden")},3e3)},getCategoryStyle(t){return t?`background: ${t.replace(")",", 0.12)").replace("hsl","hsla")}; border: 1px solid ${t}; color: ${t};`:"background: rgba(255,255,255,0.05); color: #fff;"},getChartOptions(){return{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:"#c4cbd4",font:{family:"'Inter', sans-serif",size:11}}}},scales:{x:{grid:{color:"rgba(255, 255, 255, 0.05)"},ticks:{color:"#8b98a5",font:{family:"'Inter', sans-serif"}}},y:{grid:{color:"rgba(255, 255, 255, 0.05)"},ticks:{color:"#8b98a5",font:{family:"'Inter', sans-serif"}}}}}}};window.Utils=S;const g={users:[],categories:[],charts:{},calendarDate:new Date,async initialize(){try{this.users=await API.getUsers(),this.categories=await API.getCategories()}catch(t){console.error("Failed to initialize components metadata:",t)}},async renderDashboard(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading dashboard metrics...</div>';try{const e=await API.getStats();a.innerHTML=`
        <!-- Welcome Banner Profile Summary -->
        <div class="glass-panel" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem 2rem; margin-bottom: 2rem; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-glass); box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent-cyan)); color: #fff; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px var(--primary-glow); border: 2px solid rgba(255, 255, 255, 0.1); flex-shrink: 0;">
            ${e.user?e.user.avatar:"U"}
          </div>
          <div style="flex-grow: 1;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0; color: var(--text-primary); font-family: var(--font-heading);">Welcome back, ${e.user?e.user.fullName:"User"}!</h2>
            <p style="margin: 0.15rem 0 0; color: var(--text-secondary); font-size: 0.85rem;">
              Account: <strong style="color: var(--primary); font-weight: 600;">${e.user?e.user.email:""}</strong> &bull; Role: <span style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; font-weight: 700; color: var(--accent-cyan);">${e.user?e.user.role:""}</span> &bull; Member Since: <span>${e.user?new Date(e.user.joinedDate).toLocaleDateString(void 0,{year:"numeric",month:"short"}):""}</span>
            </p>
          </div>
        </div>

        <!-- Top Stats Cards Grid -->
        <div class="dashboard-grid-stats">
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper todo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Total Tasks</h3>
              <div class="stat-number">${e.total_tasks}</div>
            </div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper progress">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
            </div>
            <div class="stat-details">
              <h3>In Progress</h3>
              <div class="stat-number">${e.in_progress_tasks}</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Completion Rate</h3>
              <div class="stat-number">${e.completion_rate}%</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper overdue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-details">
              <h3>Overdue Tasks</h3>
              <div class="stat-number" style="color: ${e.overdue_tasks>0?"var(--priority-urgent)":"inherit"}">${e.overdue_tasks}</div>
            </div>
          </div>
        </div>

        <!-- Charts Layout Row -->
        <div class="dashboard-row-analytics">
          <div class="glass-panel" style="height: 350px;">
            <div class="chart-panel-header">
              <h2>Workload Distribution</h2>
              <span class="text-muted" style="font-size: 0.8rem;">Task count by category</span>
            </div>
            <div class="chart-canvas-wrapper">
              <canvas id="chart-workload"></canvas>
            </div>
          </div>

          <div class="glass-panel" style="height: 350px;">
            <div class="chart-panel-header">
              <h2>Focus Hours Spent</h2>
              <span class="text-muted" style="font-size: 0.8rem;">Total minutes logged</span>
            </div>
            <div class="chart-canvas-wrapper">
              <canvas id="chart-time"></canvas>
            </div>
          </div>
        </div>
      `,this.renderDashboardCharts(e)}catch(e){a.innerHTML=`<div class="error-msg">Error loading dashboard: ${e.message}</div>`}}},renderDashboardCharts(t){this.charts.workload&&this.charts.workload.destroy(),this.charts.time&&this.charts.time.destroy();const a=document.getElementById("chart-workload"),e=document.getElementById("chart-time");if(!a||!e)return;const i=t.category_distribution.map(d=>d.category_name||"Uncategorized"),s=t.category_distribution.map(d=>d.count),r=t.category_distribution.map(d=>d.category_color||"#8b98a5"),o=t.time_spent_by_category.map(d=>d.category_name||"Uncategorized"),n=t.time_spent_by_category.map(d=>d.total_actual_minutes||0),l=t.time_spent_by_category.map(d=>d.category_color||"#8b98a5");this.charts.workload=new Chart(a,{type:"bar",data:{labels:i,datasets:[{label:"Tasks Count",data:s,backgroundColor:r.map(d=>d.replace(")",", 0.35)").replace("hsl","hsla")),borderColor:r,borderWidth:1.5,borderRadius:6}]},options:Utils.getChartOptions()}),this.charts.time=new Chart(e,{type:"doughnut",data:{labels:o,datasets:[{data:n,backgroundColor:l.map(d=>d.replace(")",", 0.45)").replace("hsl","hsla")),borderColor:l,borderWidth:1.5}]},options:{...Utils.getChartOptions(),scales:{x:{display:!1},y:{display:!1}},cutout:"70%"}})},async renderKanban(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading Kanban Board...</div>';try{const e=await API.getTasks(),i={Todo:[],"In Progress":[],Review:[],Completed:[]};e.forEach(r=>{i[r.status]&&i[r.status].push(r)});let s='<div class="kanban-board">';for(const[r,o]of Object.entries(i)){const n=r.toLowerCase().replace(" ","");s+=`
          <div class="kanban-column" data-status="${r}" ondragover="Components.onDragOver(event)" ondragleave="Components.onDragLeave(event)" ondrop="Components.onDrop(event, '${r}')">
            <div class="column-header">
              <div class="column-title-group">
                <span class="column-dot ${n}"></span>
                <h2>${r}</h2>
              </div>
              <span class="column-count">${o.length}</span>
            </div>
            <div class="column-cards-container">
        `,o.forEach(l=>{const d=l.priority.toLowerCase(),c=Utils.getCategoryStyle(l.category_color),u=l.status!=="Completed"&&Utils.isOverdue(l.due_date),p=l.due_date?Utils.formatDate(l.due_date):"";s+=`
            <div class="task-card" draggable="true" ondragstart="Components.onDragStart(event, '${l.id}')" onclick="Components.showTaskDetails('${l.id}')">
              <div class="card-tags">
                ${l.category_name?`<span class="category-tag" style="${c}">${l.category_icon} ${l.category_name}</span>`:"<span></span>"}
                <span class="priority-tag ${d}">${l.priority}</span>
              </div>
              <h3>${l.title}</h3>
              <p class="card-desc">${l.description||"No description provided."}</p>
              <div class="card-footer">
                <div class="card-due ${u?"overdue":""}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>${p||"No due date"}</span>
                </div>
                ${l.assignee_name?`
                  <div class="card-assignee" title="Assigned to ${l.assignee_name}">
                    <div class="avatar-circle">${l.assignee_avatar||"U"}</div>
                  </div>
                `:""}
              </div>
            </div>
          `}),s+=`
            </div>
          </div>
        `}s+="</div>",a.innerHTML=s}catch(e){a.innerHTML=`<div class="error-msg">Error loading Kanban Board: ${e.message}</div>`}}},onDragStart(t,a){t.dataTransfer.setData("text/plain",a),t.currentTarget.classList.add("dragging")},onDragOver(t){t.preventDefault(),t.currentTarget.classList.add("drag-over")},onDragLeave(t){t.currentTarget.classList.remove("drag-over")},async onDrop(t,a){t.preventDefault(),t.currentTarget.classList.remove("drag-over");const i=t.dataTransfer.getData("text/plain");if(i)try{await API.updateTask(i,{status:a}),Utils.showToast(`Task status updated to "${a}"`),window.currentView==="kanban"?this.renderKanban("view-kanban"):window.currentView==="list"&&this.renderList("view-list")}catch(s){Utils.showToast(`Failed to update task status: ${s.message}`,"error")}},currentFilters:{status:"",priority:"",category_id:"",assignee_id:"",search:""},sortBy:"due_date",sortOrder:"asc",async renderList(t){const a=document.getElementById(t);if(!a)return;let e=a.querySelector(".filter-bar"),i=a.querySelector(".list-table-container");if(!e||!i){let s='<option value="">All Categories</option>';this.categories.forEach(o=>{s+=`<option value="${o.id}">${o.icon} ${o.name}</option>`});let r='<option value="">All Assignees</option>';this.users.forEach(o=>{r+=`<option value="${o.id}">${o.name}</option>`}),a.innerHTML=`
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="form-control" id="list-filter-search" placeholder="Search tasks..." value="${this.currentFilters.search}">
          </div>
          <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
            <select class="form-control" id="list-filter-status" style="width: 140px;">
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
            <select class="form-control" id="list-filter-priority" style="width: 140px;">
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <select class="form-control" id="list-filter-category" style="width: 160px;">
              ${s}
            </select>
            <select class="form-control" id="list-filter-assignee" style="width: 160px;">
              ${r}
            </select>
          </div>
        </div>
        <div class="list-table-container glass-panel">
          <table class="list-table">
            <thead>
              <tr>
                <th onclick="Components.sortList('title')">Task Name</th>
                <th onclick="Components.sortList('status')">Status</th>
                <th onclick="Components.sortList('priority')">Priority</th>
                <th onclick="Components.sortList('category_id')">Category</th>
                <th onclick="Components.sortList('assignee_id')">Assignee</th>
                <th onclick="Components.sortList('due_date')">Due Date</th>
                <th onclick="Components.sortList('actual_minutes')">Time Spent</th>
              </tr>
            </thead>
            <tbody id="list-tasks-body">
              <tr><td colspan="7" style="text-align: center;">Loading tasks...</td></tr>
            </tbody>
          </table>
        </div>
      `,document.getElementById("list-filter-search").addEventListener("input",o=>{this.currentFilters.search=o.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-status").addEventListener("change",o=>{this.currentFilters.status=o.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-priority").addEventListener("change",o=>{this.currentFilters.priority=o.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-category").addEventListener("change",o=>{this.currentFilters.category_id=o.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-assignee").addEventListener("change",o=>{this.currentFilters.assignee_id=o.target.value,this.fetchAndRenderListBody()})}this.fetchAndRenderListBody()},async fetchAndRenderListBody(){const t=document.getElementById("list-tasks-body");if(t)try{let a=await API.getTasks(this.currentFilters);if(a.sort((i,s)=>{let r=i[this.sortBy],o=s[this.sortBy];return r==null&&(r=""),o==null&&(o=""),typeof r=="string"?this.sortOrder==="asc"?r.localeCompare(o):o.localeCompare(r):this.sortOrder==="asc"?r-o:o-r}),a.length===0){t.innerHTML='<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No tasks match selected filter criteria.</td></tr>';return}let e="";a.forEach(i=>{const s=i.priority.toLowerCase(),r=i.status.toLowerCase().replace(" ",""),o=Utils.getCategoryStyle(i.category_color),n=i.status!=="Completed"&&Utils.isOverdue(i.due_date);e+=`
          <tr>
            <td>
              <span class="list-task-title" onclick="Components.showTaskDetails('${i.id}')">${i.title}</span>
            </td>
            <td>
              <span class="status-badge ${r}">${i.status}</span>
            </td>
            <td>
              <span class="priority-tag ${s}">${i.priority}</span>
            </td>
            <td>
              ${i.category_name?`<span class="category-tag" style="${o}">${i.category_icon} ${i.category_name}</span>`:'<span class="text-muted">—</span>'}
            </td>
            <td>
              ${i.assignee_name?`
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div class="avatar-circle">${i.assignee_avatar}</div>
                  <span>${i.assignee_name}</span>
                </div>
              `:'<span class="text-muted">—</span>'}
            </td>
            <td class="${n?"text-danger":""}" style="${n?"color: var(--priority-urgent); font-weight: 600;":""}">
              ${i.due_date?Utils.formatDate(i.due_date):'<span class="text-muted">—</span>'}
            </td>
            <td>
              <span class="time-spent-badge" style="font-weight: 500;">
                ⏱️ ${Utils.formatMinutes(i.actual_minutes)} / ${Utils.formatMinutes(i.estimated_minutes)}
              </span>
            </td>
          </tr>
        `}),t.innerHTML=e}catch(a){t.innerHTML=`<tr><td colspan="7" style="text-align: center; color: var(--priority-urgent);">Error: ${a.message}</td></tr>`}},sortList(t){this.sortBy===t?this.sortOrder=this.sortOrder==="asc"?"desc":"asc":(this.sortBy=t,this.sortOrder="asc"),this.fetchAndRenderListBody()},async renderCalendar(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading calendar dates...</div>';try{const e=await API.getTasks(),i=this.calendarDate.getFullYear(),s=this.calendarDate.getMonth(),r=new Date(i,s,1).getDay(),o=new Date(i,s+1,0).getDate(),n=new Date(i,s,0).getDate();let d=`
        <div class="glass-panel">
          <div class="calendar-header">
            <h2>${["January","February","March","April","May","June","July","August","September","October","November","December"][s]} ${i}</h2>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(-1)" style="padding: 0.5rem 0.8rem;">&lt;</button>
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(0)" style="padding: 0.5rem 0.8rem;">Today</button>
              <button class="btn btn-secondary" onclick="Components.navigateCalendar(1)" style="padding: 0.5rem 0.8rem;">&gt;</button>
            </div>
          </div>
          <div class="calendar-grid">
            <!-- Day labels -->
            <div class="calendar-day-label">Sun</div>
            <div class="calendar-day-label">Mon</div>
            <div class="calendar-day-label">Tue</div>
            <div class="calendar-day-label">Wed</div>
            <div class="calendar-day-label">Thu</div>
            <div class="calendar-day-label">Fri</div>
            <div class="calendar-day-label">Sat</div>
      `;for(let m=r;m>0;m--){const b=n-m+1;d+=`
          <div class="calendar-cell inactive">
            <div class="calendar-date">${b}</div>
          </div>
        `}const c=new Date().toISOString().split("T")[0];for(let m=1;m<=o;m++){const b=new Date(i,s,m),w=`${i}-${(s+1).toString().padStart(2,"0")}-${m.toString().padStart(2,"0")}`,$=e.filter(v=>v.due_date===w);d+=`
          <div class="calendar-cell ${w===c?"today":""}">
            <div class="calendar-date">${m}</div>
            <div style="display: flex; flex-direction: column; gap: 0.3rem; overflow-y: auto; flex-grow: 1;">
              ${$.map(v=>{const I=v.priority==="Urgent"?"var(--priority-urgent)":v.priority==="High"?"var(--priority-high)":"var(--primary)",k=v.category_color||I;return`
                  <div class="calendar-task-item" style="background: ${k.replace(")",", 0.15)").replace("hsl","hsla")}; border-left: 3px solid ${k}; color: #fff;" onclick="Components.showTaskDetails('${v.id}'); event.stopPropagation();">
                    ${v.title}
                  </div>
                `}).join("")}
            </div>
          </div>
        `}const p=42-(r+o);for(let m=1;m<=p;m++)d+=`
          <div class="calendar-cell inactive">
            <div class="calendar-date">${m}</div>
          </div>
        `;d+=`
          </div>
        </div>
      `,a.innerHTML=d}catch(e){a.innerHTML=`<div class="error-msg">Error loading calendar: ${e.message}</div>`}}},navigateCalendar(t){t===0?this.calendarDate=new Date:this.calendarDate.setMonth(this.calendarDate.getMonth()+t),this.renderCalendar("view-calendar")},async showTaskDetails(t){const a=document.getElementById("modal-container");if(a){a.innerHTML='<div class="modal-box"><div class="modal-body">Loading task details...</div></div>',a.classList.remove("hidden");try{const e=await API.getTask(t);let i='<option value="">No Category</option>';this.categories.forEach(n=>{i+=`<option value="${n.id}" ${e.category_id===n.id?"selected":""}>${n.icon} ${n.name}</option>`});let s='<option value="">No Assignee</option>';this.users.forEach(n=>{s+=`<option value="${n.id}" ${e.assignee_id===n.id?"selected":""}>${n.name} (${n.role})</option>`});const r=e.estimated_minutes?e.estimated_minutes:0,o=e.estimated_minutes>0?Math.min(Math.round(e.actual_minutes/e.estimated_minutes*100),100):0;a.innerHTML=`
        <div class="modal-box large">
          <div class="modal-header">
            <h2>Task Detail Settings</h2>
            <button class="modal-close" onclick="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="detail-layout">
              
              <!-- Left Side: Core Edit Form -->
              <form id="task-detail-form" class="detail-main" onsubmit="Components.saveTaskDetails(event, '${e.id}')">
                <div class="form-group">
                  <label for="detail-title">Task Title</label>
                  <input type="text" id="detail-title" class="form-control" value="${e.title}" required>
                </div>
                
                <div class="form-group">
                  <label for="detail-desc">Description</label>
                  <textarea id="detail-desc" class="form-control" rows="4" style="resize: none;">${e.description||""}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-status">Status</label>
                    <select id="detail-status" class="form-control">
                      <option value="Todo" ${e.status==="Todo"?"selected":""}>Todo</option>
                      <option value="In Progress" ${e.status==="In Progress"?"selected":""}>In Progress</option>
                      <option value="Review" ${e.status==="Review"?"selected":""}>Review</option>
                      <option value="Completed" ${e.status==="Completed"?"selected":""}>Completed</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-priority">Priority</label>
                    <select id="detail-priority" class="form-control">
                      <option value="Low" ${e.priority==="Low"?"selected":""}>Low</option>
                      <option value="Medium" ${e.priority==="Medium"?"selected":""}>Medium</option>
                      <option value="High" ${e.priority==="High"?"selected":""}>High</option>
                      <option value="Urgent" ${e.priority==="Urgent"?"selected":""}>Urgent</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-category">Category</label>
                    <select id="detail-category" class="form-control">
                      ${i}
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-assignee">Assignee</label>
                    <select id="detail-assignee" class="form-control">
                      ${s}
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-due">Due Date</label>
                    <input type="date" id="detail-due" class="form-control" value="${e.due_date||""}">
                  </div>
                  <div class="form-group">
                    <label for="detail-estimate">Estimate (Minutes)</label>
                    <input type="number" id="detail-estimate" class="form-control" min="0" value="${r}">
                  </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                  <button type="submit" class="btn btn-primary" style="flex-grow: 1;">Save Changes</button>
                  <button type="button" class="btn btn-danger" onclick="Components.deleteTask('${e.id}')">Delete Task</button>
                </div>
              </form>

              <!-- Right Side: Focus Timer, Comments and Activity Logs -->
              <div class="detail-side">
                
                <!-- Time & Focus Section -->
                <div>
                  <div class="detail-section-title">Focus & Time Progress</div>
                  <div style="margin-bottom: 0.8rem; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span>Logged: <strong>${Utils.formatMinutes(e.actual_minutes)}</strong></span>
                    <span>Estimate: <strong>${Utils.formatMinutes(e.estimated_minutes)}</strong></span>
                  </div>
                  
                  <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 1.2rem;">
                    <div style="width: ${o}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 4px;"></div>
                  </div>

                  <button class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;" onclick="Components.loadTaskToTimer('${e.id}', '${e.title.replace(/'/g,"\\'")}')">
                    ⏱️ Load Focus Timer
                  </button>
                </div>

                <!-- Comments Feed -->
                <div>
                  <div class="detail-section-title">Comments Feed</div>
                  <div class="comments-feed" id="modal-comments-feed">
                    ${this.renderCommentsList(e.comments)}
                  </div>
                  
                  <div style="display: flex; gap: 0.5rem;">
                    <select id="comment-user-id" class="form-control" style="width: 100px; padding: 0.4rem 0.5rem; font-size: 0.8rem;">
                      ${this.users.map(n=>`<option value="${n.id}">${n.avatar}</option>`).join("")}
                    </select>
                    <input type="text" id="comment-text-input" class="form-control" placeholder="Add a comment..." style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                    <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="Components.postComment('${e.id}')">Post</button>
                  </div>
                </div>

                <!-- Audit History Logs -->
                <div>
                  <div class="detail-section-title">Task Log Audit Trail</div>
                  <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.75rem; padding-right: 0.5rem;">
                    ${e.activity_logs.map(n=>`
                      <div style="border-left: 2px solid var(--border-glass); padding-left: 0.6rem; margin-left: 0.2rem;">
                        <span style="color: var(--text-muted);">${new Date(n.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span> - 
                        <strong>${n.user_name||"System"}</strong>: 
                        <span style="color: var(--text-secondary);">${n.details}</span>
                      </div>
                    `).join("")}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      `}catch(e){a.innerHTML=`<div class="modal-box"><div class="modal-body text-danger">Error: ${e.message}</div></div>`}}},renderCommentsList(t){return!t||t.length===0?'<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0;">No comments yet. Be the first!</div>':t.map(a=>`
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-author">${a.user_name} (${a.user_role})</span>
          <span class="comment-time">${new Date(a.created_at).toLocaleDateString([],{month:"short",day:"numeric"})}</span>
        </div>
        <div class="comment-body">${a.content}</div>
      </div>
    `).join("")},async postComment(t){const a=document.getElementById("comment-text-input"),e=document.getElementById("comment-user-id");if(!a||!a.value.trim()||!e)return;const i=a.value.trim(),s=e.value;try{await API.postComment(t,{user_id:s,content:i}),a.value="",Utils.showToast("Comment posted successfully"),this.showTaskDetails(t),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(r){Utils.showToast(`Failed to post comment: ${r.message}`,"error")}},async saveTaskDetails(t,a){t.preventDefault();const e=document.getElementById("detail-title").value.trim(),i=document.getElementById("detail-desc").value.trim(),s=document.getElementById("detail-status").value,r=document.getElementById("detail-priority").value,o=document.getElementById("detail-category").value,n=document.getElementById("detail-assignee").value,l=document.getElementById("detail-due").value,d=document.getElementById("detail-estimate").value,c={title:e,description:i,status:s,priority:r,category_id:o||null,assignee_id:n||null,due_date:l||null,estimated_minutes:d?parseInt(d):0};try{await API.updateTask(a,c),Utils.showToast("Task updated successfully"),closeModal(),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(u){Utils.showToast(`Failed to update task: ${u.message}`,"error")}},async deleteTask(t){if(confirm("Are you absolutely sure you want to delete this task? This action is permanent."))try{await API.deleteTask(t),Utils.showToast("Task deleted successfully"),closeModal(),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(a){Utils.showToast(`Failed to delete task: ${a.message}`,"error")}},loadTaskToTimer(t,a){window.loadTimerTask&&(window.loadTimerTask(t,a),closeModal(),Utils.showToast(`"${a}" loaded into focus timer`))},showCreateTaskModal(){const t=document.getElementById("modal-container");if(!t)return;let a='<option value="">No Category</option>';this.categories.forEach(i=>{a+=`<option value="${i.id}">${i.icon} ${i.name}</option>`});let e='<option value="">No Assignee</option>';this.users.forEach(i=>{e+=`<option value="${i.id}">${i.name} (${i.role})</option>`}),t.innerHTML=`
      <div class="modal-box">
        <div class="modal-header">
          <h2>Create New Workspace Task</h2>
          <button class="modal-close" onclick="closeModal()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form id="create-task-form" onsubmit="Components.createTask(event)">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem;">
            <div class="form-group">
              <label for="create-title">Task Title</label>
              <input type="text" id="create-title" class="form-control" placeholder="e.g. Code auth route tests" required>
            </div>
            
            <div class="form-group">
              <label for="create-desc">Description</label>
              <textarea id="create-desc" class="form-control" rows="3" placeholder="Describe the task objective..." style="resize: none;"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-status">Initial Status</label>
                <select id="create-status" class="form-control">
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-group">
                <label for="create-priority">Priority</label>
                <select id="create-priority" class="form-control">
                  <option value="Low">Low</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-category">Category</label>
                <select id="create-category" class="form-control">
                  ${a}
                </select>
              </div>
              <div class="form-group">
                <label for="create-assignee">Assignee</label>
                <select id="create-assignee" class="form-control">
                  ${e}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label for="create-due">Due Date</label>
                <input type="date" id="create-due" class="form-control">
              </div>
              <div class="form-group">
                <label for="create-estimate">Estimate (Minutes)</label>
                <input type="number" id="create-estimate" class="form-control" min="0" value="0">
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Task</button>
          </div>
        </form>
      </div>
    `,t.classList.remove("hidden")},async createTask(t){t.preventDefault();const a=document.getElementById("create-title").value.trim(),e=document.getElementById("create-desc").value.trim(),i=document.getElementById("create-status").value,s=document.getElementById("create-priority").value,r=document.getElementById("create-category").value,o=document.getElementById("create-assignee").value,n=document.getElementById("create-due").value,l=document.getElementById("create-estimate").value,d={title:a,description:e,status:i,priority:s,category_id:r||null,assignee_id:o||null,due_date:n||null,estimated_minutes:l?parseInt(l):0};try{await API.createTask(d),Utils.showToast("Task created successfully"),closeModal(),window.currentView==="dashboard"&&this.renderDashboard("view-dashboard"),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list"),window.currentView==="calendar"&&this.renderCalendar("view-calendar")}catch(c){Utils.showToast(`Failed to create task: ${c.message}`,"error")}},async renderLogs(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading audit logs...</div>';try{const e=await API.getActivityLogs();if(e.length===0){a.innerHTML=`
          <div class="glass-panel" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            No activities recorded in the workspace yet.
          </div>
        `;return}let i=`
        <div class="glass-panel">
          <h2 style="font-family: var(--font-heading); margin-bottom: 1.5rem; font-size: 1.3rem;">Workspace Activity Timeline</h2>
          <div class="logs-timeline">
      `;e.forEach(s=>{const r=s.action,o=new Date(s.created_at),n=o.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),l=o.toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"}),d=s.task_title?` on <strong style="color: var(--primary); cursor: pointer;" onclick="Components.showTaskDetails(${s.task_id})">${s.task_title}</strong>`:"";i+=`
          <div class="log-item">
            <span class="log-dot ${r}"></span>
            <div class="log-meta">
              <span class="log-actor">${s.user_name||"System"}</span>
              <span>•</span>
              <span>${l} at ${n}</span>
            </div>
            <div class="log-details">${s.details}${d}</div>
          </div>
        `}),i+=`
          </div>
        </div>
      `,a.innerHTML=i}catch(e){a.innerHTML=`<div class="error-msg">Error loading activity logs: ${e.message}</div>`}}},async renderSettings(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading settings...</div>';try{this.categories=await API.getCategories();let e="";this.categories.forEach(i=>{const s=["Design","Engineering","Marketing","General"].includes(i.name),r=Utils.getCategoryStyle(i.color);e+=`
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); margin-bottom: 0.6rem;">
            <span class="category-tag" style="${r}">${i.icon} ${i.name}</span>
            ${s?`
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Default</span>
            `:`
               <button class="btn-timer-ctrl" onclick="Components.deleteCategory('${i.id}')" style="border-color: rgba(235, 87, 87, 0.2); color: var(--priority-urgent);">Delete</button>
            `}
          </div>
        `}),a.innerHTML=`
        <div class="settings-grid">
          
          <div class="glass-panel">
            <div class="settings-section-title">Category Settings</div>
            <p class="settings-description">Custom categories allow tag sorting and project visual grouping.</p>
            
            <div style="margin-bottom: 2rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
               ${e}
            </div>

            <form id="create-category-form" onsubmit="Components.createCategory(event)" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
               <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">Create Custom Category</div>
               <div class="form-group">
                 <label for="cat-name">Category Name</label>
                 <input type="text" id="cat-name" class="form-control" placeholder="e.g. Documentation" required>
               </div>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                 <div class="form-group">
                   <label for="cat-color">Color (HSL)</label>
                   <select id="cat-color" class="form-control">
                     <option value="hsl(280, 80%, 65%)">Purple</option>
                     <option value="hsl(200, 80%, 65%)">Cyan</option>
                     <option value="hsl(340, 80%, 65%)">Pink</option>
                     <option value="hsl(120, 80%, 65%)">Green</option>
                     <option value="hsl(45, 90%, 60%)">Yellow</option>
                     <option value="hsl(15, 85%, 60%)">Orange</option>
                     <option value="hsl(0, 80%, 60%)">Red</option>
                   </select>
                 </div>
                 <div class="form-group">
                   <label for="cat-icon">Icon (Emoji)</label>
                   <select id="cat-icon" class="form-control">
                     <option value="🎨">🎨 Art / Design</option>
                     <option value="💻">💻 Code / Dev</option>
                     <option value="📈">📈 Charts / Marketing</option>
                     <option value="⚙️">⚙️ General</option>
                     <option value="🧪">🧪 Testing</option>
                     <option value="📝">📝 Writing</option>
                     <option value="🚀">🚀 Release</option>
                     <option value="💬">💬 Chat</option>
                   </select>
                 </div>
               </div>
               <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Create Category</button>
            </form>
          </div>

          <div class="glass-panel">
            <div class="settings-section-title">Workspace Data Portability</div>
            <p class="settings-description">Export your complete database, tasks, comment feeds, and activity timelines to a backup JSON file, or restore from a previously exported backup.</p>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
               <div>
                 <div style="font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 0.5rem;">Export Data Backup</div>
                 <button type="button" class="btn btn-secondary" onclick="Components.exportWorkspaceData()" style="width: 100%; justify-content: center; gap: 0.5rem;">
                   📥 Download Workspace Backup JSON
                 </button>
               </div>

               <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem;">
                 <div style="font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 0.5rem;">Restore Workspace Backup</div>
                 <div class="import-upload-area" onclick="document.getElementById('import-file-selector').click()">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                   <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Click to choose file or drag backup JSON here</div>
                   <input type="file" id="import-file-selector" class="hidden" accept=".json" onchange="Components.importWorkspaceData(event)">
                 </div>
               </div>
            </div>
          </div>

        </div>
      `}catch(e){a.innerHTML=`<div class="error-msg">Error loading settings: ${e.message}</div>`}}},async deleteCategory(t){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Managing custom categories is disabled in Guest Mode. Upgrade to save changes.","error");return}try{await API.deleteCategory(t),Utils.showToast("Category deleted successfully"),this.renderSettings("view-settings")}catch(a){Utils.showToast(`Failed to delete category: ${a.message}`,"error")}},async createCategory(t){if(t.preventDefault(),window.currentUser&&window.currentUser.isGuest){Utils.showToast("Creating custom categories is disabled in Guest Mode. Upgrade to save changes.","error");return}const a=document.getElementById("cat-name").value.trim(),e=document.getElementById("cat-color").value,i=document.getElementById("cat-icon").value;try{await API.createCategory({name:a,color:e,icon:i}),Utils.showToast("Category created successfully"),document.getElementById("cat-name").value="",this.renderSettings("view-settings")}catch(s){Utils.showToast(`Failed to create category: ${s.message}`,"error")}},async exportWorkspaceData(){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Workspace backup exports are disabled in Guest Mode.","error");return}try{const t=await API.exportData(),a=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),e=URL.createObjectURL(a),i=document.createElement("a");i.href=e,i.download=`zenith_workspace_backup_${new Date().toISOString().split("T")[0]}.json`,i.click(),URL.revokeObjectURL(e),Utils.showToast("Backup JSON downloaded successfully")}catch(t){Utils.showToast(`Export failed: ${t.message}`,"error")}},async importWorkspaceData(t){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Restoring database backups is disabled in Guest Mode.","error"),t.target.value="";return}const a=t.target.files[0];if(!a)return;const e=new FileReader;e.onload=async i=>{try{const s=JSON.parse(i.target.result);if(!confirm("WARNING: Importing this backup will overwrite ALL current database tasks, comments, categories, and timelines. Do you want to proceed?")){t.target.value="";return}const r=await API.importData(s);Utils.showToast(r.message),await this.initialize();const o=document.querySelector('[data-view="dashboard"]');o&&o.click()}catch(s){Utils.showToast(`Import failed: Invalid backup file - ${s.message}`,"error")}finally{t.target.value=""}},e.readAsText(a)},async renderProfile(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading profile details...</div>';try{const e=await API.getProfile(),i=new Date(e.joinedDate).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"});a.innerHTML=`
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; margin-top: 1rem;">
          <!-- Profile Badge Left Panel -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent-cyan)); color: #fff; font-size: 2.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 0 20px var(--primary-glow); border: 3px solid rgba(255, 255, 255, 0.1);">
              ${e.avatar||"U"}
            </div>
            
            <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.4rem; font-family: var(--font-heading); color: var(--text-primary);">${e.fullName}</h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.2rem;">${e.email}</p>
            
            <div style="display: inline-block; padding: 0.4rem 1.2rem; background: rgba(130, 80, 250, 0.12); border: 1px solid rgba(130, 80, 250, 0.25); border-radius: 50px; color: var(--primary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.5rem;">
              ${e.role}
            </div>
            
            <div style="border-top: 1px solid var(--border-glass); width: 100%; padding-top: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              <span>Member since: <strong>${i}</strong></span>
            </div>
          </div>

          <!-- Account Statistics Right Panel -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Main Stats Card -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); flex-grow: 1;">
              <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; font-family: var(--font-heading); color: var(--text-primary); border-bottom: 1px solid var(--border-glass); padding-bottom: 0.8rem;">Workspace Productivity Summary</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;">
                  <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Assigned Tasks</span>
                  <span style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-cyan);">${e.stats.total_tasks}</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;">
                  <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Completed Tasks</span>
                  <span style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--color-completed);">${e.stats.completed_tasks}</span>
                </div>
              </div>

              <!-- Completion Progress Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.6rem;">
                  <span style="color: var(--text-secondary); font-weight: 500;">Task Completion Rate</span>
                  <span style="color: var(--primary); font-weight: 600;">${e.stats.completion_percent}%</span>
                </div>
                <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; margin-bottom: 1.5rem;">
                  <div style="width: ${e.stats.completion_percent}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 5px;"></div>
                </div>
              </div>
            </div>
            
            <!-- Quick Actions Options Card -->
            <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.2rem;">Account Security</h4>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">Logout of your active web session securely.</p>
              </div>
              <button class="btn btn-danger" onclick="app.handleUserLogout()">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      `}catch(e){a.innerHTML=`<div style="padding: 2rem; text-align: center; color: var(--priority-urgent);">Failed to load profile details: ${e.message}</div>`}}},async renderClaims(t){const a=document.getElementById(t);if(a){a.innerHTML='<div class="loading">Loading workflow status...</div>';try{const e=await API.request("GET","/claims/workflow");let i=3;e.claimSubmitted?i=11:e.claimReviewed?i=10:e.garageSelected?i=9:e.claimEstimated?i=8:e.damageAnalysisCompleted?i=7:e.documentsUploaded?i=6:e.incidentReported?i=5:e.policyVerified?i=4:e.profileCompleted&&(i=3);const s=Math.round(i/11*100),r=(n,l)=>n?'<span style="color: var(--color-completed); margin-right: 0.5rem;">✓</span>':l?'<span style="color: var(--accent-pink); margin-right: 0.5rem; font-weight: bold;">⏳</span>':'<span style="color: var(--text-muted); margin-right: 0.5rem;">⬜</span>',o=(n,l)=>n?"color: var(--text-primary); font-weight: 500; margin-bottom: 0.6rem; font-size: 0.85rem; display: flex; align-items: center;":l?"color: var(--accent-pink); font-weight: 700; margin-bottom: 0.6rem; font-size: 0.85rem; display: flex; align-items: center;":"color: var(--text-muted); margin-bottom: 0.6rem; font-size: 0.85rem; display: flex; align-items: center;";window.claimsWizard={async verifyPolicy(){const n=document.getElementById("claim-policy-num").value.trim();if(!n){Utils.showToast("Please enter a valid Policy Number","error");return}try{Utils.showToast("Verifying policy with insurance grid..."),await API.request("POST","/claims/workflow",{policyVerified:!0,policyDetails:{policyNumber:n,provider:"TaskFlow Insurance Ltd",amount:5e4}}),Utils.showToast("Policy Verified Successfully!"),g.renderClaims(t)}catch(l){Utils.showToast(l.message,"error")}},async submitIncident(){const n=document.getElementById("claim-incident-desc").value.trim(),l=document.getElementById("claim-incident-loc").value.trim(),d=document.getElementById("claim-incident-date").value;if(!n||!l||!d){Utils.showToast("Please complete all incident details","error");return}try{await API.request("POST","/claims/workflow",{incidentReported:!0,incidentDetails:{description:n,location:l,date:d}}),Utils.showToast("Incident Report Filed!"),g.renderClaims(t)}catch(c){Utils.showToast(c.message,"error")}},async uploadDocs(){try{Utils.showToast("Uploading incident photos and ID scans..."),await API.request("POST","/claims/workflow",{documentsUploaded:!0,uploadedDocs:["car_front_dent.png","license_scan.jpg","policy_holder_signature.pdf"]}),Utils.showToast("All mandatory documents uploaded!"),g.renderClaims(t)}catch(n){Utils.showToast(n.message,"error")}},async startAiAnalysis(){const n=document.getElementById("btn-start-ai"),l=document.getElementById("ai-spinner");n&&(n.disabled=!0),l&&l.classList.remove("hidden"),setTimeout(async()=>{try{await API.request("POST","/claims/workflow",{damageAnalysisCompleted:!0,aiAssessment:{score:"87%",damageLevel:"Medium Body Damage",repairsRequired:["Front Bumper","Right Wing Quarter-Panel"]}}),Utils.showToast("AI Damage Assessment Complete!"),g.renderClaims(t)}catch(d){Utils.showToast(d.message,"error")}},2e3)},async acceptEstimation(){try{await API.request("POST","/claims/workflow",{claimEstimated:!0,estimationDetails:{approvedAmount:3280,laborHours:12,deductible:250}}),Utils.showToast("Estimation accepted!"),g.renderClaims(t)}catch(n){Utils.showToast(n.message,"error")}},async confirmGarage(){const n=document.getElementById("claim-garage-select");if(!n)return;const l=n.value;try{await API.request("POST","/claims/workflow",{garageSelected:!0,selectedGarage:l}),Utils.showToast(`Selected repair shop: ${l}`),g.renderClaims(t)}catch(d){Utils.showToast(d.message,"error")}},async approveReview(){try{await API.request("POST","/claims/workflow",{claimReviewed:!0}),Utils.showToast("Claim details reviewed!"),g.renderClaims(t)}catch(n){Utils.showToast(n.message,"error")}},async resetWorkflow(){try{Utils.showToast("Resetting claims workflow..."),await API.request("POST","/claims/workflow",{policyVerified:!1,incidentReported:!1,documentsUploaded:!1,damageAnalysisCompleted:!1,claimEstimated:!1,garageSelected:!1,claimReviewed:!1,claimSubmitted:!1,policyDetails:null,incidentDetails:null,uploadedDocs:[],aiAssessment:null,estimationDetails:null,selectedGarage:null}),g.renderClaims(t)}catch(n){Utils.showToast(n.message,"error")}}},a.innerHTML=`
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: start; animation: fadeIn 0.4s ease; text-align: left;">
          
          <!-- Progress Tracker Side Panel -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); font-family: var(--font-heading);">Claims Progress</h3>
            <div style="background: rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 1.2rem;">
              <div style="width: ${s}%; height: 100%; background: linear-gradient(90deg, var(--accent-pink), var(--primary)); transition: width 0.3s ease;"></div>
            </div>
            <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 1.5rem;">
              Progress: <span style="color: var(--accent-pink);">${s}% Complete</span>
            </p>
            
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="${o(!0,!1)}">${r(!0,!1)} User Register</li>
              <li style="${o(!0,!1)}">${r(!0,!1)} Active Login</li>
              <li style="${o(e.profileCompleted,i===3)}">${r(e.profileCompleted,i===3)} Complete Profile</li>
              <li style="${o(e.policyVerified,i===4)}">${r(e.policyVerified,i===4)} Policy Verification</li>
              <li style="${o(e.incidentReported,i===5)}">${r(e.incidentReported,i===5)} Incident Report</li>
              <li style="${o(e.documentsUploaded,i===6)}">${r(e.documentsUploaded,i===6)} Upload Documents</li>
              <li style="${o(e.damageAnalysisCompleted,i===7)}">${r(e.damageAnalysisCompleted,i===7)} AI Damage Analysis</li>
              <li style="${o(e.claimEstimated,i===8)}">${r(e.claimEstimated,i===8)} Claim Estimation</li>
              <li style="${o(e.garageSelected,i===9)}">${r(e.garageSelected,i===9)} Garage Selection</li>
              <li style="${o(e.claimReviewed,i===10)}">${r(e.claimReviewed,i===10)} Claim Review</li>
              <li style="${o(e.claimSubmitted,i===11)}">${r(e.claimSubmitted,i===11)} Claim Submission</li>
            </ul>

            <button class="btn btn-secondary btn-sm" onclick="claimsWizard.resetWorkflow()" style="margin-top: 1.5rem; width: 100%; border-color: rgba(220,53,69,0.3); color: var(--priority-urgent);">
              Reset Claims Flow
            </button>
          </div>

          <!-- Wizard Core View Card -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 2rem;">
            
            ${(()=>{var n,l,d;switch(i){case 3:return`
                    <h2>Step 3: Complete Profile Details</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">To submit insurance claims, you must populate your account profile with a valid Full Name, Email, and Mobile Number.</p>
                    <div style="background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.3); padding: 1rem; border-radius: var(--radius-md); color: var(--text-primary); margin-bottom: 1.5rem;">
                      ⚠️ Profile is currently incomplete.
                    </div>
                    <button class="btn btn-primary" onclick="window.location.hash = '#/profile'">
                      Go to Profile Details Page →
                    </button>
                  `;case 4:return`
                    <h2>Step 4: Policy Verification</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Enter your auto insurance policy identifier code to bind and verify coverage details.</p>
                    <div class="form-group" style="margin-bottom: 1.5rem; max-width: 400px;">
                      <label style="display: block; margin-bottom: 0.5rem;">Policy Identifier Code</label>
                      <input type="text" id="claim-policy-num" class="form-control" placeholder="e.g. POL-98745" value="POL-49271">
                    </div>
                    
                    <button class="btn btn-primary" onclick="claimsWizard.verifyPolicy()">
                      Verify Policy Number →
                    </button>
                  `;case 5:return`
                    <h2>Step 5: Incident Report</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Provide accurate accident summary details to describe the body collision incident.</p>
                    <div class="form-group" style="margin-bottom: 1rem;">
                      <label style="display: block; margin-bottom: 0.5rem;">Date of Collision</label>
                      <input type="date" id="claim-incident-date" class="form-control" style="max-width: 250px;">
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                      <label style="display: block; margin-bottom: 0.5rem;">Location of Incident</label>
                      <input type="text" id="claim-incident-loc" class="form-control" placeholder="e.g. 5th Avenue Crossing, New York">
                    </div>
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                      <label style="display: block; margin-bottom: 0.5rem;">Description of Accident</label>
                      <textarea id="claim-incident-desc" class="form-control" rows="3" placeholder="Describe how the crash occurred..."></textarea>
                    </div>
                    
                    <button class="btn btn-primary" onclick="claimsWizard.submitIncident()">
                      Submit Incident Details →
                    </button>
                  `;case 6:return`
                    <h2>Step 6: Upload Mandatory Documents</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Submit pictures of driver license identification card and vehicle crash damage signs.</p>
                    <div style="background: rgba(255,255,255,0.02); border: 2px dashed var(--border-glass); border-radius: var(--radius-md); padding: 2rem; text-align: center; margin-bottom: 1.5rem;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="margin-bottom: 0.8rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Click below to simulate uploading driving_license.jpg and car_front_dent.png</p>
                    </div>
                    <button class="btn btn-primary" onclick="claimsWizard.uploadDocs()">
                      Upload Mandatory Documents →
                    </button>
                  `;case 7:return`
                    <h2>Step 7: AI Body Damage Assessment</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Trigger the TaskFlow artificial intelligence vision models to estimate dent and scratch depths.</p>
                    <div style="margin-bottom: 1.5rem;">
                      <button class="btn btn-primary" id="btn-start-ai" onclick="claimsWizard.startAiAnalysis()" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <span>Run AI Claims Scanner</span>
                        <span class="spinner hidden" id="ai-spinner" style="width: 14px; height: 14px;"></span>
                      </button>
                    </div>
                  `;case 8:return`
                    <h2>Step 8: Automated Claims Cost Estimation</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">The AI claims assessment engine has generated the following collision repair quote details:</p>
                    <div style="background: rgba(139,92,246,0.08); border: 1px solid var(--border-glass); padding: 1.2rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                      <div><strong>Estimated Auto Repair Parts:</strong> $2,280.00</div>
                      <div><strong>Est. Mechanic Labor Charge:</strong> $1,000.00</div>
                      <div><strong>Estimated Total Quote:</strong> $3,280.00</div>
                      <div style="border-top: 1px solid var(--border-glass); margin-top: 0.5rem; padding-top: 0.5rem; color: var(--accent-pink);">
                        <strong>Net Approved Payout (Excl. $250 Deductible):</strong> $3,030.00
                      </div>
                    </div>
                    <button class="btn btn-primary" onclick="claimsWizard.acceptEstimation()">
                      Accept Quote & Proceed →
                    </button>
                  `;case 9:return`
                    <h2>Step 9: Direct Repair Garage Selection</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Choose from our list of verified direct-repair partner repair garages in your area.</p>
                    <div class="form-group" style="margin-bottom: 1.5rem; max-width: 400px;">
                      <label style="display: block; margin-bottom: 0.5rem;">Select Auto Service Repair Shop</label>
                      <select id="claim-garage-select" class="form-control" style="background: #1a1a24; color: #fff;">
                        <option value="Apex Dent & Collision (Brooklyn)">Apex Dent & Collision Repair Shop</option>
                        <option value="Metro Auto Refinishing (Queens)">Metro Auto Refinishing Shop</option>
                        <option value="Precision Collision Specialists (Manhattan)">Precision Collision Specialists Shop</option>
                      </select>
                    </div>
                    <button class="btn btn-primary" onclick="claimsWizard.confirmGarage()">
                      Confirm Garage Choice →
                    </button>
                  `;case 10:return`
                    <h2>Step 10: General Claims Policy & Incident Review</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Please review your complete digital insurance claims filing details before submission.</p>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem;">
                      <div><strong>Policy No:</strong> ${((n=e.policyDetails)==null?void 0:n.policyNumber)||"N/A"}</div>
                      <div><strong>Incident Date:</strong> ${((l=e.incidentDetails)==null?void 0:l.date)||"N/A"}</div>
                      <div><strong>Incident Location:</strong> ${((d=e.incidentDetails)==null?void 0:d.location)||"N/A"}</div>
                      <div><strong>AI Estimated Repairs:</strong> Front Bumper, Right Wing Quarter-Panel</div>
                      <div><strong>Approved Deductible Net:</strong> $3,030.00</div>
                      <div><strong>Chosen Service Garage:</strong> ${e.selectedGarage||"N/A"}</div>
                    </div>
                    <button class="btn btn-primary" onclick="claimsWizard.approveReview()">
                      Confirm Details & Submit Claim →
                    </button>
                  `;case 11:return`
                    <h2>Step 11: Claim Submission Completed</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Your incident claim reports have been submitted. The adjusters will verify repairs soon.</p>
                    
                    <div style="background: rgba(40,167,69,0.1); border: 1px solid rgba(40,167,69,0.3); padding: 1.2rem; border-radius: var(--radius-md); text-align: center; color: var(--color-completed); font-weight: 600; margin-bottom: 2rem;">
                      🎉 Digital Claim Submitted to Insurance Broker Network
                    </div>

                    <h4 style="margin-bottom: 1rem;">Track Adjuster Status</h4>
                    <div style="display: flex; justify-content: space-between; position: relative; margin-top: 1.5rem; padding: 0 1rem;">
                      <div style="position: absolute; top: 12px; left: 10%; right: 10%; height: 2px; background: var(--border-glass); z-index: 1;">
                        <div style="width: 50%; height: 100%; background: var(--color-completed);"></div>
                      </div>
                      <div style="z-index: 2; text-align: center;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--color-completed); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 0.5rem;">✓</div>
                        <span style="font-size: 0.8rem; font-weight: 600;">Filed</span>
                      </div>
                      <div style="z-index: 2; text-align: center;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--accent-pink); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 0.5rem; font-weight: bold;">⏳</div>
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-pink);">Adjuster Review</span>
                      </div>
                      <div style="z-index: 2; text-align: center;">
                        <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.1); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 0.5rem;">3</div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Disbursed</span>
                      </div>
                    </div>
                  `;default:return"<div>No active claims workflow step details.</div>"}})()}

          </div>

        </div>
      `}catch(e){a.innerHTML=`<div style="padding: 2rem; text-align: center; color: var(--priority-urgent);">Failed to render workflow status: ${e.message}</div>`}}}};window.Components=g;window.currentView="dashboard";window.currentTimerTaskId=null;window.currentUser=null;let f=null,h=25*60,y=!1;document.addEventListener("DOMContentLoaded",async()=>{console.log("Zenith App booting...");const t=localStorage.getItem("theme"),a=document.getElementById("theme-icon-sun"),e=document.getElementById("theme-icon-moon");t==="light"?(document.documentElement.classList.add("light-theme"),a&&a.classList.remove("hidden"),e&&e.classList.add("hidden")):(document.documentElement.classList.remove("light-theme"),a&&a.classList.add("hidden"),e&&e.classList.remove("hidden")),window.app={togglePassword(s){const r=document.getElementById(s);r&&(r.type=r.type==="password"?"text":"password")},showAuthCard(s){s==="signup-card"?window.location.hash="#/signup":window.location.hash="#/login"},async handleFormLogin(s){s.preventDefault();const r=document.getElementById("login-email").value.trim(),o=document.getElementById("login-password").value,n=document.getElementById("login-remember").checked,l=document.getElementById("login-spinner"),d=document.getElementById("btn-login-submit");l&&l.classList.remove("hidden"),d&&(d.disabled=!0);try{const c=await API.login({loginId:r,password:o});localStorage.setItem("token",c.token),n?(localStorage.setItem("rememberMe","true"),localStorage.setItem("rememberedUser",r)):(localStorage.removeItem("rememberMe"),localStorage.removeItem("rememberedUser")),Utils.showToast("Login successful! Loading workspace..."),window.currentUser=null,window.location.hash="#/dashboard"}catch(c){Utils.showToast(c.message,"error")}finally{l&&l.classList.add("hidden"),d&&(d.disabled=!1)}},async handleFormSignup(s){s.preventDefault();const r=document.getElementById("signup-name").value.trim(),o=document.getElementById("signup-email").value.trim(),n=document.getElementById("signup-mobile").value.trim(),l=document.getElementById("signup-password").value,d=document.getElementById("signup-confirm").value,c=document.getElementById("signup-spinner"),u=document.getElementById("btn-signup-submit");c&&c.classList.remove("hidden"),u&&(u.disabled=!0);try{const p=await API.register({fullName:r,email:o,mobileNumber:n,password:l,confirmPassword:d});Utils.showToast(p.message),document.getElementById("signup-form").reset(),window.location.hash="#/login",setTimeout(()=>{const m=document.getElementById("login-email");m&&(m.value=o)},50)}catch(p){Utils.showToast(p.message,"error")}finally{c&&c.classList.add("hidden"),u&&(u.disabled=!1)}},async handleUserLogout(){try{localStorage.getItem("token")&&await API.logout()}catch(s){console.warn("Logout API warning:",s)}finally{const s=localStorage.getItem("rememberMe"),r=localStorage.getItem("rememberedUser");localStorage.removeItem("token"),localStorage.clear(),sessionStorage.clear(),document.cookie.split(";").forEach(c=>{document.cookie=c.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/")}),window.currentUser=null,s==="true"&&(localStorage.setItem("rememberMe","true"),localStorage.setItem("rememberedUser",r));const o=document.getElementById("login-form");o&&o.reset();const n=document.getElementById("login-email"),l=document.getElementById("login-password"),d=document.getElementById("login-remember");n&&(n.value=s==="true"&&r||""),l&&(l.value=""),d&&(d.checked=s==="true"),y&&(clearInterval(f),y=!1),Utils.showToast("Logged out successfully."),window.location.hash="#/login"}},showUpgradeScreen(){localStorage.removeItem("token"),window.currentUser=null,window.location.hash="#/signup"},toggleTheme(){const s=document.documentElement.classList.contains("light-theme"),r=document.getElementById("theme-icon-sun"),o=document.getElementById("theme-icon-moon");s?(document.documentElement.classList.remove("light-theme"),localStorage.setItem("theme","dark"),r&&r.classList.add("hidden"),o&&o.classList.remove("hidden")):(document.documentElement.classList.add("light-theme"),localStorage.setItem("theme","light"),r&&r.classList.remove("hidden"),o&&o.classList.add("hidden")),window.currentView==="dashboard"&&window.Components&&window.Components.renderDashboard("view-dashboard")}},document.querySelectorAll(".nav-item").forEach(s=>{s.addEventListener("click",()=>{const r=s.dataset.view;r&&(window.location.hash=`#/${r}`)})}),window.addEventListener("hashchange",x);const i=document.getElementById("btn-quick-new-task");i&&(i.onclick=()=>Components.showCreateTaskModal()),U(),await x()});async function x(){const t=window.location.hash||"#/",a=localStorage.getItem("token"),e=document.getElementById("landing-view"),i=document.getElementById("auth-view"),s=document.getElementById("app-view"),o=["#/","#/login","#/signup"].includes(t);if(!a){if(!o){console.log("Unauthenticated access blocked. Redirecting to login."),window.location.hash="#/login";return}t==="#/"?B():t==="#/login"?T("login-card"):t==="#/signup"&&T("signup-card");return}if(!window.currentUser)try{const c=await API.getProfile();window.currentUser=c,D(c)}catch(c){console.error("Session validation failed on route change:",c),localStorage.removeItem("token"),window.location.hash="#/";return}if(o){window.location.hash="#/dashboard";return}e.classList.add("hidden"),i.classList.add("hidden"),s.classList.remove("hidden");const n=t.substring(2)||"dashboard";window.currentView=n,document.querySelectorAll(".nav-item").forEach(c=>{c.dataset.view===n?c.classList.add("active"):c.classList.remove("active")}),document.querySelectorAll(".view-panel").forEach(c=>{c.id===`view-${n}`?c.classList.remove("hidden"):c.classList.add("hidden")});const d={dashboard:{title:"Dashboard",subtitle:"Summary and analytics overview"},kanban:{title:"Kanban Board",subtitle:"Drag and drop workflow management"},list:{title:"Task List",subtitle:"Filterable list grid view"},calendar:{title:"Calendar",subtitle:"Deadlines and schedules tracker"},logs:{title:"Activity Logs",subtitle:"System event log auditing"},claims:{title:"Claims Flow",subtitle:"Step-by-step progress tracking workflow"},settings:{title:"Settings",subtitle:"Manage categories and import/export workspace data"}}[n];d&&(document.getElementById("view-title").textContent=d.title,document.getElementById("view-subtitle").textContent=d.subtitle),C(n)}function B(){document.getElementById("landing-view").classList.remove("hidden"),document.getElementById("auth-view").classList.add("hidden"),document.getElementById("app-view").classList.add("hidden")}function T(t){if(document.getElementById("landing-view").classList.add("hidden"),document.getElementById("app-view").classList.add("hidden"),document.getElementById("auth-view").classList.remove("hidden"),document.querySelectorAll(".auth-card").forEach(a=>{a.id===t?a.classList.remove("hidden"):a.classList.add("hidden")}),t==="login-card"){const a=localStorage.getItem("rememberMe")==="true",e=localStorage.getItem("rememberedUser"),i=document.getElementById("login-email"),s=document.getElementById("login-password"),r=document.getElementById("login-remember");i&&(i.value=a&&e||""),s&&(s.value=""),r&&(r.checked=a)}API.request("GET","/auth/check-users").then(a=>{const e=document.getElementById("zero-users-notice");e&&(a&&a.count===0?e.classList.remove("hidden"):e.classList.add("hidden"))}).catch(a=>{console.warn("Failed to query users count:",a)})}function D(t){const a=document.getElementById("header-user-avatar"),e=document.getElementById("header-user-name");a&&(a.textContent=t.avatar||"??"),e&&(e.textContent=t.fullName||"User");const i=document.getElementById("sidebar-user-avatar"),s=document.getElementById("sidebar-user-name"),r=document.getElementById("sidebar-user-email");i&&(i.textContent=t.avatar||"??"),s&&(s.textContent=t.fullName||"User"),r&&(r.textContent=t.email||"");const o=document.getElementById("header-guest-badge"),n=document.getElementById("btn-header-upgrade"),l=document.getElementById("guest-warning-banner");t.isGuest?(o&&o.classList.remove("hidden"),n&&n.classList.remove("hidden"),l&&l.classList.remove("hidden")):(o&&o.classList.add("hidden"),n&&n.classList.add("hidden"),l&&l.classList.add("hidden"))}function C(t){switch(t){case"dashboard":Components.renderDashboard("view-dashboard");break;case"kanban":Components.renderKanban("view-kanban");break;case"list":Components.renderList("view-list");break;case"calendar":Components.renderCalendar("view-calendar");break;case"logs":Components.renderLogs("view-logs");break;case"settings":Components.renderSettings("view-settings");break;case"profile":Components.renderProfile("view-profile");break;case"claims":Components.renderClaims("view-claims");break;default:console.warn(`Unknown view type requested: ${t}`)}}window.closeModal=()=>{const t=document.getElementById("modal-container");t&&t.classList.add("hidden")};function U(){const t=document.getElementById("global-timer-toggle"),a=document.getElementById("global-timer-reset"),e=document.getElementById("global-timer-display");!t||!a||!e||(t.onclick=()=>{y?(clearInterval(f),y=!1,t.textContent="Resume",e.classList.remove("timer-running")):(y=!0,t.textContent="Pause",e.classList.add("timer-running"),f=setInterval(()=>{h--;const i=Math.floor(h/60),s=h%60;e.textContent=`${i.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`,h<=0&&(clearInterval(f),y=!1,t.textContent="Start",e.classList.remove("timer-running"),h=25*60,e.textContent="25:00",window.currentTimerTaskId?API.logTime(window.currentTimerTaskId,25,window.currentUser?window.currentUser.id:null).then(()=>{Utils.showToast("Pomodoro session completed! 25 minutes logged."),C(window.currentView)}).catch(r=>Utils.showToast(`Failed to log timer: ${r.message}`,"error")):Utils.showToast("Pomodoro session completed!"))},1e3))},a.onclick=()=>{clearInterval(f),y=!1,h=25*60,e.textContent="25:00",t.textContent="Start",e.classList.remove("timer-running")})}window.loadTimerTask=(t,a)=>{window.currentTimerTaskId=t;const e=document.getElementById("global-timer-task-name"),i=document.getElementById("global-timer-toggle"),s=document.getElementById("global-timer-reset");e&&(e.textContent=a),i&&(i.disabled=!1),s&&(s.disabled=!1)};
