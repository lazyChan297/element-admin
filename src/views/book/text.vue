<template>
  <component :is="elementName" v-bind="linkProps(elementName)">
    <slot />
  </component>
</template>
<script>
    export default {
        props: {
            elementName: String
        },
        data() {
            return {

            }
        },
        computed: {
            // isExternal() {
            //     if
            // }
        },
        methods: {
            linkProps(elementName) {
                console.log('绑定了这个方法和elementName属性:' + elementName)
            }
        }
    }
</script>
