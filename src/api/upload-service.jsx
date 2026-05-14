import NewService from "../core/apisService";

class UploadService extends NewService {
  constructor(props = {}) {
    super(props);
  }

  actInitMultipartUpload = (data, options) => {
    return this.post(this.apiUlr() + '/services/uploads/multipart/init', data, options);
  };

  actUploadMultipartPart = ({ uploadId, key, partNumber }, chunk, options) => {
    const params = new URLSearchParams({
      uploadId,
      key,
      partNumber,
    }).toString();

    // Tham số 1: URL
    // Tham số 2: CHUNK (Dữ liệu binary gửi đi trực tiếp)
    // Tham số 3: Config (Headers)
    return this.put(this.apiUlr() + `/services/uploads/multipart/part?${params}`, chunk, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      ...options, // Các options khác như onUploadProgress nên nằm ở đây
    });
  };

  actCompleteMultipartUpload = (data, options) => {
    return this.post(this.apiUlr() + '/services/uploads/multipart/complete', data, options);
  };

}

export default UploadService;
