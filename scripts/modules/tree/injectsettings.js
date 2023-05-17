document.querySelector("#taozhiyu_setting") && (
    document.head.insertAdjacentHTML("beforeend", "<style>.swal2-container{z-index:999999999999999999!important;color:#666;}.swal2-container code{color: orangered;font-size: unset!important;}</style>"),
    document.querySelector("#taozhiyu_setting").onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert("just demo version, haven't finished");
        // swal.fire({
        //     toast: true,
        //     position: 'bottom-' + (document.querySelector(".octotree-dock-right") ? "end" : "start"),
        //     // timer: 3000,
        //     timerProgressBar: true,
        //     didOpen: (toast) => {
        //         toast.addEventListener('mouseenter', Swal.stopTimer);
        //         toast.addEventListener('mouseleave', Swal.resumeTimer);
        //     },
        //     html: "<center>是否更新？</center>",
        //     title: "检测到新版 Octotree <code color='red'>7.7.0</code>",
        //     confirmButtonText: '前往下载更新<span class="ml-1"><svg aria-hidden="true" focusable="false" class="octicon" viewBox="0 0 16 16" width="16" height="20" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;"><path fill-rule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"></path></svg></span>',
        //     cancelButtonText: '更改提醒设置<span class="ml-1"><svg focusable="false" height="20" viewBox="0 0 16 16" version="1.1" width="16" class="octicon" aria-hidden="true"><path d="M8 16a2 2 0 001.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 008 16z"></path><path fill-rule="evenodd" d="M8 1.5A3.5 3.5 0 004.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.018.018 0 00-.003.01l.001.006c0 .002.002.004.004.006a.017.017 0 00.006.004l.007.001h10.964l.007-.001a.016.016 0 00.006-.004.016.016 0 00.004-.006l.001-.007a.017.017 0 00-.003-.01l-1.703-2.554a1.75 1.75 0 01-.294-.97V5A3.5 3.5 0 008 1.5zM3 5a5 5 0 0110 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.518 1.518 0 0113.482 13H2.518a1.518 1.518 0 01-1.263-2.36l1.703-2.554A.25.25 0 003 7.947V5z"></path></svg></span>',
        //     showCancelButton: true,
        //     showDenyButton: true,
        //     denyButtonText: '禁用更新检测<span class="ml-1"><svg focusable="false" class="octicon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="20"><path d="M199.04 289.472a384 384 0 0 0 535.488 535.488L198.976 289.536zM289.408 199.04l535.552 535.552A384 384 0 0 0 289.536 199.04zM512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z"></path></svg></span>',
        // }).then(a => {
        //     console.log(a)
        //     if (a.isConfirmed) {
        //         // 更新
        //     } else if (a.isDenied) {
        //         // 禁用更新
        //     } else {
        //         // 忽略，打开忽略设置
        //     }
        // });
    }
)