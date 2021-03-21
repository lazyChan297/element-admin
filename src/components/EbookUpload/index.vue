<template>
  <div class="upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :before-upload="boforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="fileList"
      :on-exceed="onExceed"
      :disabled="disabled"
      drag
      show-file-list
      accpept="application/epub+zip"
      class="image-upload"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">请将电子书拖入或<em>点击上传</em></div>
      <div v-else class="el-upload__text">图书已上传</div>
    </el-upload>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth'
    export default {
        props: {
            fileList: {
                type: Array,
                default() {
                    return []
                }
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                action: `${process.env.VUE_APP_BASE_API}/book/upload`
            }
        },
        computed: {
            headers() {
                return {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        },
        methods: {
            boforeUpload(file) {
                const isLimit = file.size / 1024 / 1024 > 3
                if (isLimit) {
                    return false
                }
                this.$emit('boforeUpload', file)
            },
            onSuccess(response, file) {
                const { code, msg, data } = response
                if (code === 0) {
                    this.$message({
                        message: msg,
                        type: 'success'
                    })
                    this.$emit('onSuccess', data)
                } else {
                    this.$message({
                        message: (msg && `上传失败，失败原因：${msg}`),
                        type: 'error'
                    })
                    this.$emit('onError', file)
                }
            },
            onError(err) {
                const errMsg = (err.message && JSON.parse(err.message))
                this.$message({
                    message: (errMsg && errMsg.msg && `上传失败，失败原因：${errMsg.msg}`) || '上传失败',
                    type: 'error'
                })
                this.$emit('onError', err)
            },
            onRemove(file) {
                // 文件超出大小，限制上传
                if (file.status === 'ready') {
                    this.$message({
                        message: '上传图书不能大于2M',
                        type: 'warning'
                    })
                    // this.$emit('onRemove')
                } else {
                    this.$message({
                        message: '电子书删除成功',
                        type: 'success'
                    })
                    this.$emit('onRemove')
                }
            },
            onExceed() {
                this.$message({
                    message: '每次只能上传一本电子书',
                    type: 'warning'
                })
            }
        }
    }
</script>
<style lang="scss" scoped></style>
