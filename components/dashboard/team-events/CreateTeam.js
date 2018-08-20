import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import AddedTeammates from "./AddedTeammates";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing.unit
  }
});
class CreateTeam extends Component {
  state = {
    formData: {
      name: "",
      eventName: "",
      teammate: ""
    },
    teamSize: null,
    members: [],
    error: {
      name: false,
      event: false,
      email: false
    },
    errorMsg: {
      name: "",
      email: ""
    }
  };
  deleteMember = index => {
    const members = [...this.state.members];
    members.splice(index, 1);
    this.setState({ members });
  };
  fetchTeamSize = eventName => {
    ///fetch team size ##TODO##
    const teamSize = 4;
    this.setState({
      teamSize
    });
  };
  onEventSwitch = eventName => {
    //check for Team name availability
    // ##TODO##
    let newState = JSON.parse(JSON.stringify(this.state));
    //reset teammates to zero
    newState.members = [];
    //reset email errors
    let newErrorMsg = { name: newState.errorMsg.name, email: "" };
    let newError = { name: newState.error.name, email: false };
    newState.errorMsg = newErrorMsg;
    newState.error = newError;
    //teammate email input value reset
    newState.formData.teammate = "";
    newState.formData.eventName = eventName;
    //set state
    this.setState(newState);
  };
  handleCreateTeam = () => {
    const state = this.state;
    const invitedEmails = state.members;
    const eventName = state.formData.eventName;
    const teamName = state.formData.name;
    axios
      .post("/api/create-team", { invitedEmails, eventName, teamName })
      .then(res => {
        const { data } = res;
        if (data.success) {
          const newState = JSON.parse(JSON.stringify(this.state));
          newState = {
            formData: {
              name: "",
              eventName: "",
              teammate: ""
            },
            teamSize: null,
            members: [],
            error: {
              name: false,
              event: false,
              email: false
            },
            errorMsg: {
              name: "",
              email: ""
            }
          };
          //empty state on create-team success
          this.setState(newState);
          //fetch-teams on TeamEvents component
          this.props.fetchTeams();
          //close dialog
          this.props.handleDialogClose();
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        //handle error
      });
  };
  handleChange = name => e => {
    const { formData, members } = this.state;
    const prevEventName = formData[name];
    const currentEventName = e.target.value;
    formData[name] = currentEventName;
    if (name == "eventName") {
      if (prevEventName !== currentEventName) {
        this.fetchTeamSize(formData[name]);
        this.onEventSwitch(currentEventName);
      }
    } else {
      this.setState({
        formData
      });
    }
  };
  handleAddTeammate = () => {
    const email = this.state.formData.teammate.trim();
    if (email.length === 0) {
      return;
    }
    const members = [...this.state.members];
    if (members.includes(email)) {
      alert("This email is already added!");
      return;
    }
    //check if request can be sent
    axios
      .post("/api/check-user-availability", {
        email,
        eventName: this.state.formData.eventName
      })
      .then(res => {
        const { data } = res;
        if (data.success) {
          //push email to members (state)
          members.push(email);
          let obj = { ...this.state };
          obj.members = members;
          obj.error.email = false;
          obj.errorMsg.email = "";
          obj.formData.teammate = "";
          this.setState(obj);
        } else {
          let obj = { ...this.state };
          obj.error.email = true;
          obj.errorMsg.email = data.message;
          this.setState(obj);
        }
      })
      .catch(err => {
        if (err.response.status === 401) {
          //handle
        }
        if (err.response.status === 400) {
          let obj = { ...this.state };
          obj.error.email = true;
          this.setState(obj);
        }
      });
  };
  render() {
    const { formData, members, error, errorMsg } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <FormControl
          className={classes.formControl}
          error={error.name}
          fullWidth
        >
          <InputLabel>Name</InputLabel>
          <Input value={formData.name} onChange={this.handleChange("name")} />
          <FormHelperText>
            {error.name ? "Someone already took this name" : ""}
          </FormHelperText>
        </FormControl>
        <TextField
          id="select-currency"
          className={classes.TextField}
          select
          label="Select an Event"
          value={formData.eventName}
          onChange={this.handleChange("eventName")}
          margin="normal"
          fullWidth
        >
          {this.props.registeredEvents.map(eventName => (
            <MenuItem key={eventName} value={eventName}>
              {eventName}
            </MenuItem>
          ))}
        </TextField>
        <AddedTeammates members={members} deleteMember={this.deleteMember} />
        <TextField
          className={classes.TextField}
          type="email"
          label="Email of teammate"
          value={formData.teammate}
          error={error.email}
          helperText={errorMsg.email}
          onChange={this.handleChange("teammate")}
          margin="normal"
          fullWidth
        />
        <Button
          className={classes.button}
          variant="outlined"
          onClick={this.handleAddTeammate}
        >
          {" "}
          ADD
        </Button>
        <Button
          className={classes.button}
          variant="outlined"
          onClick={this.handleCreateTeam}
        >
          CREATE TEAM
        </Button>
      </div>
    );
  }
}
export default withStyles(styles)(CreateTeam);
