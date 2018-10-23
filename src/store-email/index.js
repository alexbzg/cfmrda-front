import storage from '../storage'

const STORAGE_KEY_EMAIL = 'contact_email'

export default {
  save (email) {
    storage.save(STORAGE_KEY_EMAIL, email, 'local')
  },
  load () {
    return storage.load(STORAGE_KEY_EMAIL)
  }
}
