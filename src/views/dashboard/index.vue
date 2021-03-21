<template>
  <div class="dashboard-container">
    <div class="markdown-body" style="padding-left:20px;">
      <markdown />
    </div>

  </div>
</template>

<script>
import markdown from '@/views/dashboard/index.md'
import 'highlight.js/styles/github.css'
import 'github-markdown-css'

export default {
  name: 'Dashboard',
  components: { markdown },
  data() {
    return {

    }
  }
}
</script>
