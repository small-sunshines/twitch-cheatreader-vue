import axios, { AxiosResponse } from 'axios'
import { Token, Error, IOAuthUser } from '~/assets/types'

export const namespaced = true

export const state = (): {
  id: number|null,
  nickname: string|null,
  isAdmin: boolean,
  auth: { [key: string]: IOAuthUser }
} => {
  return {
    id: 0,
    nickname: "",
    isAdmin: false,
    auth: {}
  }
}

export const getters = {
  getUser(state) {
    return state
  }
}

export const mutations = {
  login(state, payload: {
    id: number|null,
    nickname: string|null,
    isAdmin: boolean,
    auth: { [key: string]: IOAuthUser }
  } | undefined) {
    if (payload) {
      state.id = payload.id
      state.nickname = payload.nickname
      state.isAdmin = payload.isAdmin
      state.auth = payload.auth
    }
  }
}

export const actions = {
  async login(context) {
    let data: AxiosResponse<Token|Error> = await axios({
      method: 'get',
      url: `${process.env.apiURL}auth/check`,
      withCredentials: true
    })

    if ((data.data as Error).valid) {
      /* if ((data.data as Error).status === 'Token has expired') {

      } else {

      }*/

      return undefined
    } else {
      if ((data.data as Token).exp < Math.floor(new Date().getTime()/1000) + 3600) {
        data = await axios({
          method: 'get',
          url: `${process.env.apiURL}auth/renew`,
          withCredentials: true
        })
      }
      const auth = {}

      for(const key in (data.data as Token).auth) {
        auth[key] = {
          id: (data.data as Token).auth[key].id,
          profilePhoto: (data.data as Token).auth[key].profilePhoto,
          username: (data.data as Token).auth[key].username,
          displayName: (data.data as Token).auth[key].displayName
        }
      }
      
      return context.commit("login", {
        id: (data.data as Token).id,
        nickname: (data.data as Token).nickname,
        isAdmin: (data.data as Token).isAdmin,
        auth
      })
    }
  }
}