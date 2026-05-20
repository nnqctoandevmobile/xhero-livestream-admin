import NewService from "../core/apisService";

class AdminPanelService extends NewService {
  constructor(props = {}) {
    super(props);
  }

  actGetConsultingForms = () => {
    return this.get(this.apiUlr() + '/admin/consulting-forms');
  };

  actPostNotification = (payload) => {
    return this.post(this.apiUlr() + '/admin/notifications', payload);
  }

  actCreateNewLivestream = (payload) => {
    return this.post(this.apiUlr() + '/api/admin/streams', payload);
  }

  actGetLivestreamSessions = () => {
    return this.get(this.apiUlr() + '/api/admin/streams');
  }

  actGetDetailLivestream = (id) => {
    return this.get(this.apiUlr() + '/api/admin/streams/' + id);
  }
}

export default AdminPanelService;
