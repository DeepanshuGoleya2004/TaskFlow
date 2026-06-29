(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const C="http://localhost:5050/api",I={async request(e,s,t=null){const o=`${C}${s}`,a=localStorage.getItem("token"),i={"Content-Type":"application/json"};a&&(i.Authorization=`Bearer ${a}`);const r={method:e,headers:i};t&&(r.body=JSON.stringify(t));try{const n=await fetch(o,r),l=await n.json();if(!n.ok)throw new Error(l.error||`HTTP error! status: ${n.status}`);return l}catch(n){throw console.error(`API Error on ${e} ${s}:`,n),n}},getTasks(e={}){const s=new URLSearchParams;Object.keys(e).forEach(a=>{e[a]!==void 0&&e[a]!==null&&e[a]!==""&&s.append(a,e[a])});const t=s.toString(),o=t?`/tasks?${t}`:"/tasks";return this.request("GET",o)},getTask(e){return this.request("GET",`/tasks/${e}`)},createTask(e){return this.request("POST","/tasks",e)},updateTask(e,s){return this.request("PUT",`/tasks/${e}`,s)},deleteTask(e){return this.request("DELETE",`/tasks/${e}`)},logTime(e,s,t){return this.request("POST",`/tasks/${e}/log-time`,{minutes:s,user_id:t})},getCategories(){return this.request("GET","/categories")},createCategory(e){return this.request("POST","/categories",e)},deleteCategory(e){return this.request("DELETE",`/categories/${e}`)},getUsers(){return this.request("GET","/users")},createUser(e){return this.request("POST","/users",e)},postComment(e,s){return this.request("POST",`/tasks/${e}/comments`,s)},getStats(){return this.request("GET","/dashboard/stats")},getActivityLogs(){return this.request("GET","/activity-logs")},exportData(){return this.request("GET","/system/export")},importData(e){return this.request("POST","/system/import",e)},register(e){return this.request("POST","/auth/register",e)},login(e){return this.request("POST","/auth/login",e)},guestLogin(){return this.request("POST","/auth/guest-login")},getProfile(){return this.request("GET","/auth/profile")},logout(){return this.request("POST","/auth/logout")}};window.API=I;const E={formatMinutes(e){if(!e||isNaN(e)||e<=0)return"0m";const s=Math.floor(e/60),t=e%60;return s===0?`${t}m`:t===0?`${s}h`:`${s}h ${t}m`},formatDate(e){if(!e)return"No due date";const s=new Date(e);return isNaN(s.getTime())?e:s.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},isOverdue(e){if(!e)return!1;const s=new Date;s.setHours(0,0,0,0);const t=new Date(e);return t.setHours(0,0,0,0),t<s},showToast(e,s="info"){const t=document.getElementById("notification-toast");if(!t)return;t.style.borderColor=s==="error"?"var(--priority-urgent)":"var(--primary)",t.style.boxShadow=s==="error"?"0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(235, 87, 87, 0.3)":"0 10px 30px rgba(0,0,0,0.5), 0 0 15px var(--primary-glow)";const o=s==="error"?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';t.innerHTML=`${o} <span>${e}</span>`,t.classList.remove("hidden"),this.toastTimeout&&clearTimeout(this.toastTimeout),this.toastTimeout=setTimeout(()=>{t.classList.add("hidden")},3e3)},getCategoryStyle(e){return e?`background: ${e.replace(")",", 0.12)").replace("hsl","hsla")}; border: 1px solid ${e}; color: ${e};`:"background: rgba(255,255,255,0.05); color: #fff;"},getChartOptions(){return{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:"#c4cbd4",font:{family:"'Inter', sans-serif",size:11}}}},scales:{x:{grid:{color:"rgba(255, 255, 255, 0.05)"},ticks:{color:"#8b98a5",font:{family:"'Inter', sans-serif"}}},y:{grid:{color:"rgba(255, 255, 255, 0.05)"},ticks:{color:"#8b98a5",font:{family:"'Inter', sans-serif"}}}}}}};window.Utils=E;const B={users:[],categories:[],charts:{},calendarDate:new Date,async initialize(){try{this.users=await API.getUsers(),this.categories=await API.getCategories()}catch(e){console.error("Failed to initialize components metadata:",e)}},async renderDashboard(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading dashboard metrics...</div>';try{const t=await API.getStats();s.innerHTML=`
        <!-- Welcome Banner Profile Summary -->
        <div class="glass-panel" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem 2rem; margin-bottom: 2rem; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-glass); box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent-cyan)); color: #fff; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px var(--primary-glow); border: 2px solid rgba(255, 255, 255, 0.1); flex-shrink: 0;">
            ${t.user?t.user.avatar:"U"}
          </div>
          <div style="flex-grow: 1;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0; color: var(--text-primary); font-family: var(--font-heading);">Welcome back, ${t.user?t.user.fullName:"User"}!</h2>
            <p style="margin: 0.15rem 0 0; color: var(--text-secondary); font-size: 0.85rem;">
              Account: <strong style="color: var(--primary); font-weight: 600;">${t.user?t.user.email:""}</strong> &bull; Role: <span style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; font-weight: 700; color: var(--accent-cyan);">${t.user?t.user.role:""}</span> &bull; Member Since: <span>${t.user?new Date(t.user.joinedDate).toLocaleDateString(void 0,{year:"numeric",month:"short"}):""}</span>
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
              <div class="stat-number">${t.total_tasks}</div>
            </div>
          </div>
          
          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper progress">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
            </div>
            <div class="stat-details">
              <h3>In Progress</h3>
              <div class="stat-number">${t.in_progress_tasks}</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Completion Rate</h3>
              <div class="stat-number">${t.completion_rate}%</div>
            </div>
          </div>

          <div class="stat-card glass-panel">
            <div class="stat-icon-wrapper overdue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-details">
              <h3>Overdue Tasks</h3>
              <div class="stat-number" style="color: ${t.overdue_tasks>0?"var(--priority-urgent)":"inherit"}">${t.overdue_tasks}</div>
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
      `,this.renderDashboardCharts(t)}catch(t){s.innerHTML=`<div class="error-msg">Error loading dashboard: ${t.message}</div>`}}},renderDashboardCharts(e){this.charts.workload&&this.charts.workload.destroy(),this.charts.time&&this.charts.time.destroy();const s=document.getElementById("chart-workload"),t=document.getElementById("chart-time");if(!s||!t)return;const o=e.category_distribution.map(d=>d.category_name||"Uncategorized"),a=e.category_distribution.map(d=>d.count),i=e.category_distribution.map(d=>d.category_color||"#8b98a5"),r=e.time_spent_by_category.map(d=>d.category_name||"Uncategorized"),n=e.time_spent_by_category.map(d=>d.total_actual_minutes||0),l=e.time_spent_by_category.map(d=>d.category_color||"#8b98a5");this.charts.workload=new Chart(s,{type:"bar",data:{labels:o,datasets:[{label:"Tasks Count",data:a,backgroundColor:i.map(d=>d.replace(")",", 0.35)").replace("hsl","hsla")),borderColor:i,borderWidth:1.5,borderRadius:6}]},options:Utils.getChartOptions()}),this.charts.time=new Chart(t,{type:"doughnut",data:{labels:r,datasets:[{data:n,backgroundColor:l.map(d=>d.replace(")",", 0.45)").replace("hsl","hsla")),borderColor:l,borderWidth:1.5}]},options:{...Utils.getChartOptions(),scales:{x:{display:!1},y:{display:!1}},cutout:"70%"}})},async renderKanban(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading Kanban Board...</div>';try{const t=await API.getTasks(),o={Todo:[],"In Progress":[],Review:[],Completed:[]};t.forEach(i=>{o[i.status]&&o[i.status].push(i)});let a='<div class="kanban-board">';for(const[i,r]of Object.entries(o)){const n=i.toLowerCase().replace(" ","");a+=`
          <div class="kanban-column" data-status="${i}" ondragover="Components.onDragOver(event)" ondragleave="Components.onDragLeave(event)" ondrop="Components.onDrop(event, '${i}')">
            <div class="column-header">
              <div class="column-title-group">
                <span class="column-dot ${n}"></span>
                <h2>${i}</h2>
              </div>
              <span class="column-count">${r.length}</span>
            </div>
            <div class="column-cards-container">
        `,r.forEach(l=>{const d=l.priority.toLowerCase(),c=Utils.getCategoryStyle(l.category_color),u=l.status!=="Completed"&&Utils.isOverdue(l.due_date),g=l.due_date?Utils.formatDate(l.due_date):"";a+=`
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
                  <span>${g||"No due date"}</span>
                </div>
                ${l.assignee_name?`
                  <div class="card-assignee" title="Assigned to ${l.assignee_name}">
                    <div class="avatar-circle">${l.assignee_avatar||"U"}</div>
                  </div>
                `:""}
              </div>
            </div>
          `}),a+=`
            </div>
          </div>
        `}a+="</div>",s.innerHTML=a}catch(t){s.innerHTML=`<div class="error-msg">Error loading Kanban Board: ${t.message}</div>`}}},onDragStart(e,s){e.dataTransfer.setData("text/plain",s),e.currentTarget.classList.add("dragging")},onDragOver(e){e.preventDefault(),e.currentTarget.classList.add("drag-over")},onDragLeave(e){e.currentTarget.classList.remove("drag-over")},async onDrop(e,s){e.preventDefault(),e.currentTarget.classList.remove("drag-over");const o=e.dataTransfer.getData("text/plain");if(o)try{await API.updateTask(o,{status:s}),Utils.showToast(`Task status updated to "${s}"`),window.currentView==="kanban"?this.renderKanban("view-kanban"):window.currentView==="list"&&this.renderList("view-list")}catch(a){Utils.showToast(`Failed to update task status: ${a.message}`,"error")}},currentFilters:{status:"",priority:"",category_id:"",assignee_id:"",search:""},sortBy:"due_date",sortOrder:"asc",async renderList(e){const s=document.getElementById(e);if(!s)return;let t=s.querySelector(".filter-bar"),o=s.querySelector(".list-table-container");if(!t||!o){let a='<option value="">All Categories</option>';this.categories.forEach(r=>{a+=`<option value="${r.id}">${r.icon} ${r.name}</option>`});let i='<option value="">All Assignees</option>';this.users.forEach(r=>{i+=`<option value="${r.id}">${r.name}</option>`}),s.innerHTML=`
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
              ${a}
            </select>
            <select class="form-control" id="list-filter-assignee" style="width: 160px;">
              ${i}
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
      `,document.getElementById("list-filter-search").addEventListener("input",r=>{this.currentFilters.search=r.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-status").addEventListener("change",r=>{this.currentFilters.status=r.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-priority").addEventListener("change",r=>{this.currentFilters.priority=r.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-category").addEventListener("change",r=>{this.currentFilters.category_id=r.target.value,this.fetchAndRenderListBody()}),document.getElementById("list-filter-assignee").addEventListener("change",r=>{this.currentFilters.assignee_id=r.target.value,this.fetchAndRenderListBody()})}this.fetchAndRenderListBody()},async fetchAndRenderListBody(){const e=document.getElementById("list-tasks-body");if(e)try{let s=await API.getTasks(this.currentFilters);if(s.sort((o,a)=>{let i=o[this.sortBy],r=a[this.sortBy];return i==null&&(i=""),r==null&&(r=""),typeof i=="string"?this.sortOrder==="asc"?i.localeCompare(r):r.localeCompare(i):this.sortOrder==="asc"?i-r:r-i}),s.length===0){e.innerHTML='<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No tasks match selected filter criteria.</td></tr>';return}let t="";s.forEach(o=>{const a=o.priority.toLowerCase(),i=o.status.toLowerCase().replace(" ",""),r=Utils.getCategoryStyle(o.category_color),n=o.status!=="Completed"&&Utils.isOverdue(o.due_date);t+=`
          <tr>
            <td>
              <span class="list-task-title" onclick="Components.showTaskDetails('${o.id}')">${o.title}</span>
            </td>
            <td>
              <span class="status-badge ${i}">${o.status}</span>
            </td>
            <td>
              <span class="priority-tag ${a}">${o.priority}</span>
            </td>
            <td>
              ${o.category_name?`<span class="category-tag" style="${r}">${o.category_icon} ${o.category_name}</span>`:'<span class="text-muted">—</span>'}
            </td>
            <td>
              ${o.assignee_name?`
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div class="avatar-circle">${o.assignee_avatar}</div>
                  <span>${o.assignee_name}</span>
                </div>
              `:'<span class="text-muted">—</span>'}
            </td>
            <td class="${n?"text-danger":""}" style="${n?"color: var(--priority-urgent); font-weight: 600;":""}">
              ${o.due_date?Utils.formatDate(o.due_date):'<span class="text-muted">—</span>'}
            </td>
            <td>
              <span class="time-spent-badge" style="font-weight: 500;">
                ⏱️ ${Utils.formatMinutes(o.actual_minutes)} / ${Utils.formatMinutes(o.estimated_minutes)}
              </span>
            </td>
          </tr>
        `}),e.innerHTML=t}catch(s){e.innerHTML=`<tr><td colspan="7" style="text-align: center; color: var(--priority-urgent);">Error: ${s.message}</td></tr>`}},sortList(e){this.sortBy===e?this.sortOrder=this.sortOrder==="asc"?"desc":"asc":(this.sortBy=e,this.sortOrder="asc"),this.fetchAndRenderListBody()},async renderCalendar(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading calendar dates...</div>';try{const t=await API.getTasks(),o=this.calendarDate.getFullYear(),a=this.calendarDate.getMonth(),i=new Date(o,a,1).getDay(),r=new Date(o,a+1,0).getDate(),n=new Date(o,a,0).getDate();let d=`
        <div class="glass-panel">
          <div class="calendar-header">
            <h2>${["January","February","March","April","May","June","July","August","September","October","November","December"][a]} ${o}</h2>
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
      `;for(let m=i;m>0;m--){const f=n-m+1;d+=`
          <div class="calendar-cell inactive">
            <div class="calendar-date">${f}</div>
          </div>
        `}const c=new Date().toISOString().split("T")[0];for(let m=1;m<=r;m++){const f=new Date(o,a,m),w=`${o}-${(a+1).toString().padStart(2,"0")}-${m.toString().padStart(2,"0")}`,$=t.filter(p=>p.due_date===w);d+=`
          <div class="calendar-cell ${w===c?"today":""}">
            <div class="calendar-date">${m}</div>
            <div style="display: flex; flex-direction: column; gap: 0.3rem; overflow-y: auto; flex-grow: 1;">
              ${$.map(p=>{const L=p.priority==="Urgent"?"var(--priority-urgent)":p.priority==="High"?"var(--priority-high)":"var(--primary)",b=p.category_color||L;return`
                  <div class="calendar-task-item" style="background: ${b.replace(")",", 0.15)").replace("hsl","hsla")}; border-left: 3px solid ${b}; color: #fff;" onclick="Components.showTaskDetails('${p.id}'); event.stopPropagation();">
                    ${p.title}
                  </div>
                `}).join("")}
            </div>
          </div>
        `}const g=42-(i+r);for(let m=1;m<=g;m++)d+=`
          <div class="calendar-cell inactive">
            <div class="calendar-date">${m}</div>
          </div>
        `;d+=`
          </div>
        </div>
      `,s.innerHTML=d}catch(t){s.innerHTML=`<div class="error-msg">Error loading calendar: ${t.message}</div>`}}},navigateCalendar(e){e===0?this.calendarDate=new Date:this.calendarDate.setMonth(this.calendarDate.getMonth()+e),this.renderCalendar("view-calendar")},async showTaskDetails(e){const s=document.getElementById("modal-container");if(s){s.innerHTML='<div class="modal-box"><div class="modal-body">Loading task details...</div></div>',s.classList.remove("hidden");try{const t=await API.getTask(e);let o='<option value="">No Category</option>';this.categories.forEach(n=>{o+=`<option value="${n.id}" ${t.category_id===n.id?"selected":""}>${n.icon} ${n.name}</option>`});let a='<option value="">No Assignee</option>';this.users.forEach(n=>{a+=`<option value="${n.id}" ${t.assignee_id===n.id?"selected":""}>${n.name} (${n.role})</option>`});const i=t.estimated_minutes?t.estimated_minutes:0,r=t.estimated_minutes>0?Math.min(Math.round(t.actual_minutes/t.estimated_minutes*100),100):0;s.innerHTML=`
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
              <form id="task-detail-form" class="detail-main" onsubmit="Components.saveTaskDetails(event, '${t.id}')">
                <div class="form-group">
                  <label for="detail-title">Task Title</label>
                  <input type="text" id="detail-title" class="form-control" value="${t.title}" required>
                </div>
                
                <div class="form-group">
                  <label for="detail-desc">Description</label>
                  <textarea id="detail-desc" class="form-control" rows="4" style="resize: none;">${t.description||""}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-status">Status</label>
                    <select id="detail-status" class="form-control">
                      <option value="Todo" ${t.status==="Todo"?"selected":""}>Todo</option>
                      <option value="In Progress" ${t.status==="In Progress"?"selected":""}>In Progress</option>
                      <option value="Review" ${t.status==="Review"?"selected":""}>Review</option>
                      <option value="Completed" ${t.status==="Completed"?"selected":""}>Completed</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-priority">Priority</label>
                    <select id="detail-priority" class="form-control">
                      <option value="Low" ${t.priority==="Low"?"selected":""}>Low</option>
                      <option value="Medium" ${t.priority==="Medium"?"selected":""}>Medium</option>
                      <option value="High" ${t.priority==="High"?"selected":""}>High</option>
                      <option value="Urgent" ${t.priority==="Urgent"?"selected":""}>Urgent</option>
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-category">Category</label>
                    <select id="detail-category" class="form-control">
                      ${o}
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="detail-assignee">Assignee</label>
                    <select id="detail-assignee" class="form-control">
                      ${a}
                    </select>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label for="detail-due">Due Date</label>
                    <input type="date" id="detail-due" class="form-control" value="${t.due_date||""}">
                  </div>
                  <div class="form-group">
                    <label for="detail-estimate">Estimate (Minutes)</label>
                    <input type="number" id="detail-estimate" class="form-control" min="0" value="${i}">
                  </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                  <button type="submit" class="btn btn-primary" style="flex-grow: 1;">Save Changes</button>
                  <button type="button" class="btn btn-danger" onclick="Components.deleteTask('${t.id}')">Delete Task</button>
                </div>
              </form>

              <!-- Right Side: Focus Timer, Comments and Activity Logs -->
              <div class="detail-side">
                
                <!-- Time & Focus Section -->
                <div>
                  <div class="detail-section-title">Focus & Time Progress</div>
                  <div style="margin-bottom: 0.8rem; display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span>Logged: <strong>${Utils.formatMinutes(t.actual_minutes)}</strong></span>
                    <span>Estimate: <strong>${Utils.formatMinutes(t.estimated_minutes)}</strong></span>
                  </div>
                  
                  <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 1.2rem;">
                    <div style="width: ${r}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 4px;"></div>
                  </div>

                  <button class="btn btn-secondary" style="width: 100%; display: flex; justify-content: center; gap: 0.5rem;" onclick="Components.loadTaskToTimer('${t.id}', '${t.title.replace(/'/g,"\\'")}')">
                    ⏱️ Load Focus Timer
                  </button>
                </div>

                <!-- Comments Feed -->
                <div>
                  <div class="detail-section-title">Comments Feed</div>
                  <div class="comments-feed" id="modal-comments-feed">
                    ${this.renderCommentsList(t.comments)}
                  </div>
                  
                  <div style="display: flex; gap: 0.5rem;">
                    <select id="comment-user-id" class="form-control" style="width: 100px; padding: 0.4rem 0.5rem; font-size: 0.8rem;">
                      ${this.users.map(n=>`<option value="${n.id}">${n.avatar}</option>`).join("")}
                    </select>
                    <input type="text" id="comment-text-input" class="form-control" placeholder="Add a comment..." style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                    <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="Components.postComment('${t.id}')">Post</button>
                  </div>
                </div>

                <!-- Audit History Logs -->
                <div>
                  <div class="detail-section-title">Task Log Audit Trail</div>
                  <div style="max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.75rem; padding-right: 0.5rem;">
                    ${t.activity_logs.map(n=>`
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
      `}catch(t){s.innerHTML=`<div class="modal-box"><div class="modal-body text-danger">Error: ${t.message}</div></div>`}}},renderCommentsList(e){return!e||e.length===0?'<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0;">No comments yet. Be the first!</div>':e.map(s=>`
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-author">${s.user_name} (${s.user_role})</span>
          <span class="comment-time">${new Date(s.created_at).toLocaleDateString([],{month:"short",day:"numeric"})}</span>
        </div>
        <div class="comment-body">${s.content}</div>
      </div>
    `).join("")},async postComment(e){const s=document.getElementById("comment-text-input"),t=document.getElementById("comment-user-id");if(!s||!s.value.trim()||!t)return;const o=s.value.trim(),a=t.value;try{await API.postComment(e,{user_id:a,content:o}),s.value="",Utils.showToast("Comment posted successfully"),this.showTaskDetails(e),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(i){Utils.showToast(`Failed to post comment: ${i.message}`,"error")}},async saveTaskDetails(e,s){e.preventDefault();const t=document.getElementById("detail-title").value.trim(),o=document.getElementById("detail-desc").value.trim(),a=document.getElementById("detail-status").value,i=document.getElementById("detail-priority").value,r=document.getElementById("detail-category").value,n=document.getElementById("detail-assignee").value,l=document.getElementById("detail-due").value,d=document.getElementById("detail-estimate").value,c={title:t,description:o,status:a,priority:i,category_id:r||null,assignee_id:n||null,due_date:l||null,estimated_minutes:d?parseInt(d):0};try{await API.updateTask(s,c),Utils.showToast("Task updated successfully"),closeModal(),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(u){Utils.showToast(`Failed to update task: ${u.message}`,"error")}},async deleteTask(e){if(confirm("Are you absolutely sure you want to delete this task? This action is permanent."))try{await API.deleteTask(e),Utils.showToast("Task deleted successfully"),closeModal(),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list")}catch(s){Utils.showToast(`Failed to delete task: ${s.message}`,"error")}},loadTaskToTimer(e,s){window.loadTimerTask&&(window.loadTimerTask(e,s),closeModal(),Utils.showToast(`"${s}" loaded into focus timer`))},showCreateTaskModal(){const e=document.getElementById("modal-container");if(!e)return;let s='<option value="">No Category</option>';this.categories.forEach(o=>{s+=`<option value="${o.id}">${o.icon} ${o.name}</option>`});let t='<option value="">No Assignee</option>';this.users.forEach(o=>{t+=`<option value="${o.id}">${o.name} (${o.role})</option>`}),e.innerHTML=`
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
                  ${s}
                </select>
              </div>
              <div class="form-group">
                <label for="create-assignee">Assignee</label>
                <select id="create-assignee" class="form-control">
                  ${t}
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
    `,e.classList.remove("hidden")},async createTask(e){e.preventDefault();const s=document.getElementById("create-title").value.trim(),t=document.getElementById("create-desc").value.trim(),o=document.getElementById("create-status").value,a=document.getElementById("create-priority").value,i=document.getElementById("create-category").value,r=document.getElementById("create-assignee").value,n=document.getElementById("create-due").value,l=document.getElementById("create-estimate").value,d={title:s,description:t,status:o,priority:a,category_id:i||null,assignee_id:r||null,due_date:n||null,estimated_minutes:l?parseInt(l):0};try{await API.createTask(d),Utils.showToast("Task created successfully"),closeModal(),window.currentView==="dashboard"&&this.renderDashboard("view-dashboard"),window.currentView==="kanban"&&this.renderKanban("view-kanban"),window.currentView==="list"&&this.renderList("view-list"),window.currentView==="calendar"&&this.renderCalendar("view-calendar")}catch(c){Utils.showToast(`Failed to create task: ${c.message}`,"error")}},async renderLogs(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading audit logs...</div>';try{const t=await API.getActivityLogs();if(t.length===0){s.innerHTML=`
          <div class="glass-panel" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            No activities recorded in the workspace yet.
          </div>
        `;return}let o=`
        <div class="glass-panel">
          <h2 style="font-family: var(--font-heading); margin-bottom: 1.5rem; font-size: 1.3rem;">Workspace Activity Timeline</h2>
          <div class="logs-timeline">
      `;t.forEach(a=>{const i=a.action,r=new Date(a.created_at),n=r.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),l=r.toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"}),d=a.task_title?` on <strong style="color: var(--primary); cursor: pointer;" onclick="Components.showTaskDetails(${a.task_id})">${a.task_title}</strong>`:"";o+=`
          <div class="log-item">
            <span class="log-dot ${i}"></span>
            <div class="log-meta">
              <span class="log-actor">${a.user_name||"System"}</span>
              <span>•</span>
              <span>${l} at ${n}</span>
            </div>
            <div class="log-details">${a.details}${d}</div>
          </div>
        `}),o+=`
          </div>
        </div>
      `,s.innerHTML=o}catch(t){s.innerHTML=`<div class="error-msg">Error loading activity logs: ${t.message}</div>`}}},async renderSettings(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading settings...</div>';try{this.categories=await API.getCategories();let t="";this.categories.forEach(o=>{const a=["Design","Engineering","Marketing","General"].includes(o.name),i=Utils.getCategoryStyle(o.color);t+=`
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); margin-bottom: 0.6rem;">
            <span class="category-tag" style="${i}">${o.icon} ${o.name}</span>
            ${a?`
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Default</span>
            `:`
               <button class="btn-timer-ctrl" onclick="Components.deleteCategory('${o.id}')" style="border-color: rgba(235, 87, 87, 0.2); color: var(--priority-urgent);">Delete</button>
            `}
          </div>
        `}),s.innerHTML=`
        <div class="settings-grid">
          
          <div class="glass-panel">
            <div class="settings-section-title">Category Settings</div>
            <p class="settings-description">Custom categories allow tag sorting and project visual grouping.</p>
            
            <div style="margin-bottom: 2rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
               ${t}
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
      `}catch(t){s.innerHTML=`<div class="error-msg">Error loading settings: ${t.message}</div>`}}},async deleteCategory(e){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Managing custom categories is disabled in Guest Mode. Upgrade to save changes.","error");return}try{await API.deleteCategory(e),Utils.showToast("Category deleted successfully"),this.renderSettings("view-settings")}catch(s){Utils.showToast(`Failed to delete category: ${s.message}`,"error")}},async createCategory(e){if(e.preventDefault(),window.currentUser&&window.currentUser.isGuest){Utils.showToast("Creating custom categories is disabled in Guest Mode. Upgrade to save changes.","error");return}const s=document.getElementById("cat-name").value.trim(),t=document.getElementById("cat-color").value,o=document.getElementById("cat-icon").value;try{await API.createCategory({name:s,color:t,icon:o}),Utils.showToast("Category created successfully"),document.getElementById("cat-name").value="",this.renderSettings("view-settings")}catch(a){Utils.showToast(`Failed to create category: ${a.message}`,"error")}},async exportWorkspaceData(){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Workspace backup exports are disabled in Guest Mode.","error");return}try{const e=await API.exportData(),s=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(s),o=document.createElement("a");o.href=t,o.download=`zenith_workspace_backup_${new Date().toISOString().split("T")[0]}.json`,o.click(),URL.revokeObjectURL(t),Utils.showToast("Backup JSON downloaded successfully")}catch(e){Utils.showToast(`Export failed: ${e.message}`,"error")}},async importWorkspaceData(e){if(window.currentUser&&window.currentUser.isGuest){Utils.showToast("Restoring database backups is disabled in Guest Mode.","error"),e.target.value="";return}const s=e.target.files[0];if(!s)return;const t=new FileReader;t.onload=async o=>{try{const a=JSON.parse(o.target.result);if(!confirm("WARNING: Importing this backup will overwrite ALL current database tasks, comments, categories, and timelines. Do you want to proceed?")){e.target.value="";return}const i=await API.importData(a);Utils.showToast(i.message),await this.initialize();const r=document.querySelector('[data-view="dashboard"]');r&&r.click()}catch(a){Utils.showToast(`Import failed: Invalid backup file - ${a.message}`,"error")}finally{e.target.value=""}},t.readAsText(s)},async renderProfile(e){const s=document.getElementById(e);if(s){s.innerHTML='<div class="loading">Loading profile details...</div>';try{const t=await API.getProfile(),o=new Date(t.joinedDate).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"});s.innerHTML=`
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; margin-top: 1rem;">
          <!-- Profile Badge Left Panel -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: var(--shadow-main); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent-cyan)); color: #fff; font-size: 2.5rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 0 20px var(--primary-glow); border: 3px solid rgba(255, 255, 255, 0.1);">
              ${t.avatar||"U"}
            </div>
            
            <h2 style="font-size: 1.8rem; font-weight: 700; margin-bottom: 0.4rem; font-family: var(--font-heading); color: var(--text-primary);">${t.fullName}</h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.2rem;">${t.email}</p>
            
            <div style="display: inline-block; padding: 0.4rem 1.2rem; background: rgba(130, 80, 250, 0.12); border: 1px solid rgba(130, 80, 250, 0.25); border-radius: 50px; color: var(--primary); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1.5rem;">
              ${t.role}
            </div>
            
            <div style="border-top: 1px solid var(--border-glass); width: 100%; padding-top: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
              <span>Member since: <strong>${o}</strong></span>
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
                  <span style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--accent-cyan);">${t.stats.total_tasks}</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;">
                  <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">Completed Tasks</span>
                  <span style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--color-completed);">${t.stats.completed_tasks}</span>
                </div>
              </div>

              <!-- Completion Progress Bar -->
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.6rem;">
                  <span style="color: var(--text-secondary); font-weight: 500;">Task Completion Rate</span>
                  <span style="color: var(--primary); font-weight: 600;">${t.stats.completion_percent}%</span>
                </div>
                <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; margin-bottom: 1.5rem;">
                  <div style="width: ${t.stats.completion_percent}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--primary)); border-radius: 5px;"></div>
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
      `}catch(t){s.innerHTML=`<div style="padding: 2rem; text-align: center; color: var(--priority-urgent);">Failed to load profile details: ${t.message}</div>`}}}};window.Components=B;window.currentView="dashboard";window.currentTimerTaskId=null;window.currentUser=null;let y=null,h=25*60,v=!1;document.addEventListener("DOMContentLoaded",async()=>{console.log("Zenith App booting...");const e=localStorage.getItem("theme"),s=document.getElementById("theme-icon-sun"),t=document.getElementById("theme-icon-moon");e==="light"?(document.documentElement.classList.add("light-theme"),s&&s.classList.remove("hidden"),t&&t.classList.add("hidden")):(document.documentElement.classList.remove("light-theme"),s&&s.classList.add("hidden"),t&&t.classList.remove("hidden")),window.app={togglePassword(a){const i=document.getElementById(a);i&&(i.type=i.type==="password"?"text":"password")},showAuthCard(a){a==="signup-card"?window.location.hash="#/signup":window.location.hash="#/login"},async handleFormLogin(a){a.preventDefault();const i=document.getElementById("login-email").value.trim(),r=document.getElementById("login-password").value,n=document.getElementById("login-spinner"),l=document.getElementById("btn-login-submit");n&&n.classList.remove("hidden"),l&&(l.disabled=!0);try{const d=await API.login({loginId:i,password:r});localStorage.setItem("token",d.token),Utils.showToast("Login successful! Loading workspace..."),window.currentUser=null,window.location.hash="#/dashboard"}catch(d){Utils.showToast(d.message,"error")}finally{n&&n.classList.add("hidden"),l&&(l.disabled=!1)}},async handleFormSignup(a){a.preventDefault();const i=document.getElementById("signup-name").value.trim(),r=document.getElementById("signup-email").value.trim(),n=document.getElementById("signup-mobile").value.trim(),l=document.getElementById("signup-password").value,d=document.getElementById("signup-confirm").value,c=document.getElementById("signup-spinner"),u=document.getElementById("btn-signup-submit");c&&c.classList.remove("hidden"),u&&(u.disabled=!0);try{const g=await API.register({fullName:i,email:r,mobileNumber:n,password:l,confirmPassword:d});Utils.showToast(g.message),document.getElementById("signup-form").reset(),window.location.hash="#/login",setTimeout(()=>{const m=document.getElementById("login-email");m&&(m.value=r)},50)}catch(g){Utils.showToast(g.message,"error")}finally{c&&c.classList.add("hidden"),u&&(u.disabled=!1)}},async handleUserLogout(){try{localStorage.getItem("token")&&await API.logout()}catch(a){console.warn("Logout API warning:",a)}finally{localStorage.removeItem("token"),localStorage.clear(),document.cookie.split(";").forEach(a=>{document.cookie=a.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/")}),window.currentUser=null,v&&(clearInterval(y),v=!1),Utils.showToast("Logged out successfully."),window.location.hash="#/login"}},showUpgradeScreen(){localStorage.removeItem("token"),window.currentUser=null,window.location.hash="#/signup"},toggleTheme(){const a=document.documentElement.classList.contains("light-theme"),i=document.getElementById("theme-icon-sun"),r=document.getElementById("theme-icon-moon");a?(document.documentElement.classList.remove("light-theme"),localStorage.setItem("theme","dark"),i&&i.classList.add("hidden"),r&&r.classList.remove("hidden")):(document.documentElement.classList.add("light-theme"),localStorage.setItem("theme","light"),i&&i.classList.remove("hidden"),r&&r.classList.add("hidden")),window.currentView==="dashboard"&&window.Components&&window.Components.renderDashboard("view-dashboard")}},document.querySelectorAll(".nav-item").forEach(a=>{a.addEventListener("click",()=>{const i=a.dataset.view;i&&(window.location.hash=`#/${i}`)})}),window.addEventListener("hashchange",k);const o=document.getElementById("btn-quick-new-task");o&&(o.onclick=()=>Components.showCreateTaskModal()),_(),await k()});async function k(){const e=window.location.hash||"#/",s=localStorage.getItem("token"),t=document.getElementById("landing-view"),o=document.getElementById("auth-view"),a=document.getElementById("app-view"),r=["#/","#/login","#/signup"].includes(e);if(!s){if(!r){console.log("Unauthenticated access blocked. Redirecting to login."),window.location.hash="#/login";return}e==="#/"?S():e==="#/login"?x("login-card"):e==="#/signup"&&x("signup-card");return}if(!window.currentUser)try{const c=await API.getProfile();window.currentUser=c,D(c)}catch(c){console.error("Session validation failed on route change:",c),localStorage.removeItem("token"),window.location.hash="#/";return}if(r){window.location.hash="#/dashboard";return}t.classList.add("hidden"),o.classList.add("hidden"),a.classList.remove("hidden");const n=e.substring(2)||"dashboard";window.currentView=n,document.querySelectorAll(".nav-item").forEach(c=>{c.dataset.view===n?c.classList.add("active"):c.classList.remove("active")}),document.querySelectorAll(".view-panel").forEach(c=>{c.id===`view-${n}`?c.classList.remove("hidden"):c.classList.add("hidden")});const d={dashboard:{title:"Dashboard",subtitle:"Summary and analytics overview"},kanban:{title:"Kanban Board",subtitle:"Drag and drop workflow management"},list:{title:"Task List",subtitle:"Filterable list grid view"},calendar:{title:"Calendar",subtitle:"Deadlines and schedules tracker"},logs:{title:"Activity Logs",subtitle:"System event log auditing"},settings:{title:"Settings",subtitle:"Manage categories and import/export workspace data"}}[n];d&&(document.getElementById("view-title").textContent=d.title,document.getElementById("view-subtitle").textContent=d.subtitle),T(n)}function S(){document.getElementById("landing-view").classList.remove("hidden"),document.getElementById("auth-view").classList.add("hidden"),document.getElementById("app-view").classList.add("hidden")}function x(e){document.getElementById("landing-view").classList.add("hidden"),document.getElementById("app-view").classList.add("hidden"),document.getElementById("auth-view").classList.remove("hidden"),document.querySelectorAll(".auth-card").forEach(s=>{s.id===e?s.classList.remove("hidden"):s.classList.add("hidden")}),API.request("GET","/auth/check-users").then(s=>{const t=document.getElementById("zero-users-notice");t&&(s&&s.count===0?t.classList.remove("hidden"):t.classList.add("hidden"))}).catch(s=>{console.warn("Failed to query users count:",s)})}function D(e){const s=document.getElementById("header-user-avatar"),t=document.getElementById("header-user-name");s&&(s.textContent=e.avatar||"??"),t&&(t.textContent=e.fullName||"User");const o=document.getElementById("sidebar-user-avatar"),a=document.getElementById("sidebar-user-name"),i=document.getElementById("sidebar-user-email");o&&(o.textContent=e.avatar||"??"),a&&(a.textContent=e.fullName||"User"),i&&(i.textContent=e.email||"");const r=document.getElementById("header-guest-badge"),n=document.getElementById("btn-header-upgrade"),l=document.getElementById("guest-warning-banner");e.isGuest?(r&&r.classList.remove("hidden"),n&&n.classList.remove("hidden"),l&&l.classList.remove("hidden")):(r&&r.classList.add("hidden"),n&&n.classList.add("hidden"),l&&l.classList.add("hidden"))}function T(e){switch(e){case"dashboard":Components.renderDashboard("view-dashboard");break;case"kanban":Components.renderKanban("view-kanban");break;case"list":Components.renderList("view-list");break;case"calendar":Components.renderCalendar("view-calendar");break;case"logs":Components.renderLogs("view-logs");break;case"settings":Components.renderSettings("view-settings");break;default:console.warn(`Unknown view type requested: ${e}`)}}window.closeModal=()=>{const e=document.getElementById("modal-container");e&&e.classList.add("hidden")};function _(){const e=document.getElementById("global-timer-toggle"),s=document.getElementById("global-timer-reset"),t=document.getElementById("global-timer-display");!e||!s||!t||(e.onclick=()=>{v?(clearInterval(y),v=!1,e.textContent="Resume",t.classList.remove("timer-running")):(v=!0,e.textContent="Pause",t.classList.add("timer-running"),y=setInterval(()=>{h--;const o=Math.floor(h/60),a=h%60;t.textContent=`${o.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`,h<=0&&(clearInterval(y),v=!1,e.textContent="Start",t.classList.remove("timer-running"),h=25*60,t.textContent="25:00",window.currentTimerTaskId?API.logTime(window.currentTimerTaskId,25,window.currentUser?window.currentUser.id:null).then(()=>{Utils.showToast("Pomodoro session completed! 25 minutes logged."),T(window.currentView)}).catch(i=>Utils.showToast(`Failed to log timer: ${i.message}`,"error")):Utils.showToast("Pomodoro session completed!"))},1e3))},s.onclick=()=>{clearInterval(y),v=!1,h=25*60,t.textContent="25:00",e.textContent="Start",t.classList.remove("timer-running")})}window.loadTimerTask=(e,s)=>{window.currentTimerTaskId=e;const t=document.getElementById("global-timer-task-name"),o=document.getElementById("global-timer-toggle"),a=document.getElementById("global-timer-reset");t&&(t.textContent=s),o&&(o.disabled=!1),a&&(a.disabled=!1)};
