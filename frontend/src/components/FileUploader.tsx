import api from '../api/client'

export default function FileUploader({applicationId}:{applicationId:number}){
  async function upload(file:File){
    const key = `user/${applicationId}/docs/${crypto.randomUUID()}-${file.name}`
    const { data: presign } = await api.post('/documents/presign/', { key })
    const formData = new FormData()
    Object.entries(presign.fields).forEach(([k,v])=> formData.append(k, String(v)))
    formData.append('file', file)
    await fetch(presign.url, { method:'POST', body: formData })
    await api.post('/documents/', { application: applicationId, kind: 'other', s3_key: key })
    alert('Uploaded!')
  }
  return <input type='file' onChange={e=> e.target.files && upload(e.target.files[0])} />
}
