# WSA

1. Edit job-widget.js and job-widget-entry(html) code and test with any tool(codepen for example) you like.
2. Commit
3. Generate minified js online.
4. Copy and paste minified js code to wsa_job_widget_1_0.min.js and commit(update version in the name).
5. Get raw link of wsa_job_widget_1_0.min.js on github. For example: https://raw.githubusercontent.com/Mu-1017/WSA/main/wsa_job_widget_1_0.min.js
6. Replace the word "raw.githubusercontent" to "rawgit" from the above link, and you will get: https://rawgit.com/Mu-1017/WSA/main/wsa_job_widget_1_0.min.js
7. Open website: https://www.jsdelivr.com/rawgit
8. Convert the link from step 7 and you will get a new link: https://rawgit.com/Mu-1017/WSA/main/wsa_job_widget_1_0.min.js
9. Update the job-widget-entry html code. replace the script src with the link from step 8.
10. Then you can inject the job-widget-entry html code(below) anywhere.

<div class="teamtailor-jobs-widget" 
data-teamtailor-limit="10"
data-teamtailor-pagenum="1"
data-teamtailor-popup="true"
data-teamtailor-department-select="true"
data-teamtailor-location-select="true"
data-teamtailor-feed="public"
data-teamtailor-api-key="st4Z6Z8T3t6W1gCE94V9ZWBg13Odbltk_8HHtJFw"
data-teamtailor-region=""></div>
<script src="https://cdn.jsdelivr.net/gh/Mu-1017/WSA@main/wsa_job_widget_1_0.min.js"></script>
