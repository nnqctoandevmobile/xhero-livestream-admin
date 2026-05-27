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
}

export default AdminPanelService;
