<template>
  <el-form
    ref="postForm"
    :model="postForm"
    :rules="rules"
  >
    <sticky :class="'sub-navbar'">
      <el-botton v-if="!isEdit" @click="showGuide">显示帮助</el-botton>
      <el-button
        v-loading="loading"
        type="success"
        @click="submitForm"
      >
        {{ isEdit ? '编辑图书' : '新增图书' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <Warning />
        <el-col :span="24">
          <e-book-upload
            :file-list="fileList"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <!-- <el-input></el-input> -->
            <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
              书名
            </MDinput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="作者：" :label-width="labelWidth" prop="author">
                <el-input
                  v-model="postForm.author"
                  placeholder="作者"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出版社：" :label-width="labelWidth" prop="publisher">
                <el-input
                  v-model="postForm.publisher"
                  placeholder="出版社"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="语言：" :label-width="labelWidth" prop="language">
                <el-input
                  v-model="postForm.language"
                  placeholder="语言"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="根文件：" :label-width="labelWidth" prop="rootFile">
                <el-input
                  v-model="postForm.rootFile"
                  placeholder="根文件"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="文件路径：" :label-width="labelWidth" prop="filePath">
                <el-input
                  v-model="postForm.filePath"
                  placeholder="文件路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="解压路径：" :label-width="labelWidth" prop="unzipPath">
                <el-input
                  v-model="postForm.unzipPath"
                  placeholder="解压路径"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="封面路径：" :label-width="labelWidth" prop="coverPath">
                <el-input
                  v-model="postForm.coverPath"
                  placeholder="封面路径"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件名称：" :label-width="labelWidth" prop="originalName">
                <el-input
                  v-model="postForm.originalName"
                  placeholder="文件名称"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="封面：" label-width="120px" prop="cover">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label-width="120px" label="目录：" prop="contents">
                <div v-if="contentsTree && contentsTree.length > 0" class="contents-wrapper">
                  <el-tree :data="contentsTree" @node-click="onContentsClick" />
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>
<script>
    import Sticky from '../../../components/Sticky/index'
    import Warning from './Warning'
    import EBookUpload from '@/components/EbookUpload'
    import MDinput from '@/components/MDinput'
    import { createBook, getBook, updateBook } from '../../../api/book'
    const fields = {
        title: '标题',
        author: '作者',
        publisher: '出版社',
        language: '语言'
    }
    export default {
        components: {
            Sticky,
            Warning,
            EBookUpload,
            MDinput
        },
        props: {
            isEdit: Boolean
        },
        data() {
            const validatedRequire = (rule, value, callback) => {
                if (!value || value.length === 0) {
                    console.log('error')
                    callback(new Error(fields[rule.field] + '必须填写'))
                } else {
                    console.log('continue')
                    callback()
                }
            }
            return {
                loading: false,
                postForm: {
                    status: 'draft'
                },
                fileList: [],
                labelWidth: '120px',
                contentsTree: '',
                rules: {
                    title: [{ validator: validatedRequire }],
                    author: [{ validator: validatedRequire }],
                    publisher: [{ validator: validatedRequire }],
                    language: [{ validator: validatedRequire }]
                }
            }
        },
        created() {
            if (this.isEdit) {
                const fileName = this.$route.params.fileName
                this.getBookData(fileName)
            }
        },
        methods: {
            setData(data) {
                const {
                    title,
                    author,
                    publisher,
                    language,
                    rootFile,
                    cover,
                    coverPath,
                    url,
                    originalName,
                    contentsTree,
                    contents,
                    fileName,
                    filePath,
                    unzipPath
                } = data
                this.postForm = {
                    ...this.postForm,
                    title,
                    author,
                    publisher,
                    language,
                    rootFile,
                    cover,
                    coverPath,
                    url,
                    originalName,
                    contents,
                    fileName,
                    filePath,
                    unzipPath
                }
                this.contentsTree = contentsTree
                this.fileList = [{ name: originalName, url }]
            },
            setDefault() {
                this.$refs.postForm.resetFields()
                this.contentsTree = []
                this.fileList = []
            },
            showGuide() {

            },
            // 点击目录跳转到指定页面
            onContentsClick(data) {
                console.log(data.text)
                if (data.text) {
                    window.open(data.text)
                }
            },
            submitForm() {
                const onSuccess = (response) => {
                    const { msg } = response
                    this.$notify({
                        title: '操作成功',
                        message: msg,
                        type: 'success',
                        duration: 2000
                    })
                    this.loading = false
                }
                if (!this.loading) {
                    this.loading = true
                    this.$refs['postForm'].validate((valid, fields) => {
                        if (valid) {
                            const book = Object.assign({}, this.postForm)
                            console.log(book)
                            delete book.contentsTree
                            if (!this.isEdit) {
                                createBook(book).then((response) => {
                                    onSuccess(response)
                                    this.setDefault()
                                }).catch(() => {
                                    this.loading = false
                                })
                            } else {
                                updateBook(book).then(response => {
                                    onSuccess(response)
                                }).catch(() => {
                                    this.loading = false
                                })
                            }
                        } else {
                            const message = fields[Object.keys(fields)[0]][0]
                            this.$message({ message, type: 'error' })
                            this.loading = false
                        }
                    })
                }
            },
            getBookData(fileName) {
                getBook(fileName).then((response) => {
                    this.setData(response.data)
                })
            },
            onUploadSuccess(data) {
                this.setData(data)
            },
            onUploadRemove() {
                this.setDefault()
            }
        }
    }
</script>
<style lang="scss">
.detail-container {
    padding: 40px 50px 100px;
    .preview-img {
        width: 200px;
        height: 270px;
    }
}
</style>
