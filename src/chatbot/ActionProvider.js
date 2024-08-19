class ActionProvider {
  constructor(
    createChatBotMessage,
    setStateFunc,
    createClientMessage,
    stateRef,
    createCustomMessage,
    ...rest
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  greet = () => {
    const message = this.createChatBotMessage("Bonjour coment je peux vous aider ?");
    this.setChatbotMessage(message);
  }

  describeCompanion = () => {
    const message = this.createChatBotMessage("Ensemble Autrement est une association de loi 1901 qui accompagne des personnes en situation de handicap psychique. Nous offrons des services dans trois domaines : Aide à domicile, Vie sociale, et Habitat.");
    this.setChatbotMessage(message);
  }

  listCompanionFunctionalities = () => {
    const message = this.createChatBotMessage("Nos missions incluent la construction de projets individualisés, des animations collectives, des solutions d'habitat adapté et la gestion des votes et sondages.");
    this.setChatbotMessage(message);
  }

  handleEventManagement = () => {
    const message = this.createChatBotMessage("Vous pouvez consulter la liste des événements, y participer et gérer les tâches associées.");
    this.setChatbotMessage(message);
  }

  handleVoteAndConsultation = () => {
    const message = this.createChatBotMessage("Nous organisons des votes et des sondages. Les résultats sont analysés et stockés dans notre base de données.");
    this.setChatbotMessage(message);
  }

  handleGED = () => {
    const message = this.createChatBotMessage("Notre système GED permet de stocker les documents de manière sécurisée avec chiffrement et sauvegardes régulières.");
    this.setChatbotMessage(message);
  }

  setChatbotMessage = (message) => {
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  }
}

export default ActionProvider;
