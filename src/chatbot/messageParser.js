class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    console.log(message);
    const lowercase = message.toLowerCase();

    if (lowercase.includes("hello") || lowercase.includes("bonjour")) {
      this.actionProvider.greet();
    }

    if (lowercase.includes("présentation") || lowercase.includes("association") || lowercase.includes("aide aux personnes âgées")) {
      this.actionProvider.describeCompanion();
    }

    if (lowercase.includes("services") || lowercase.includes("missions")) {
      this.actionProvider.listCompanionFunctionalities();
    }

    if (lowercase.includes("événements") || lowercase.includes("participation") || lowercase.includes("tâches")) {
      this.actionProvider.handleEventManagement();
    }

    if (lowercase.includes("votes") || lowercase.includes("sondages") || lowercase.includes("consultation")) {
      this.actionProvider.handleVoteAndConsultation();
    }

    if (lowercase.includes("gestion documentaire") || lowercase.includes("GED") || lowercase.includes("documents")) {
      this.actionProvider.handleGED();
    }

    // Nouveaux déclencheurs pour les services spécifiques
    if (lowercase.includes("assistance") || lowercase.includes("vie quotidienne") || lowercase.includes("aide à domicile")) {
      this.actionProvider.handleDailyLifeAssistance();
    }

    if (lowercase.includes("activités sociales") || lowercase.includes("animations") || lowercase.includes("rencontres")) {
      this.actionProvider.handleSocialActivities();
    }
  }
}

export default MessageParser;
