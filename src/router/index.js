import { createRouter,createWebHistory } from "vue-router";
import Home from "@/components/Home.vue";
import Login from "@/components/Login.vue";
import Grades from "@/components/Grades.vue";
import Courses from "@/components/Courses.vue";
import Students from "@/components/Students.vue";
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
const routes=[
    {
        path:'/',
        redirect:"/login"
    },
    {
        path:'/home',
        component:Home,
        children:[
            {
                path:'/home/grades',
                component:Grades
            },
            {
                path:"/home/courses",
                component:Courses
            },{
                path:"/home/students",
                component:Students           
            }
        ]
    },
    {
        path:'/login',
        component:Login
    },
]
const router=createRouter({
    history:createWebHistory(),
    routes
})
router.beforeEach((to,from,next)=>{
    const tokenStore=useTokenStore()
    if(to.path!='/login'){
        if(tokenStore.isTokenValid())next()
        else next('/login')
    }else next()
})
export default router