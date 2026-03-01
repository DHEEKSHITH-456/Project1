/// <reference types="vite/client" /> 
import axios from 'axios'

const baseURL = import.meta.env.DEV ? '/api' : '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

const t = typeof localStorage !== 'undefined' ? localStorage.getItem('zypark_token') : null
if (t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`
