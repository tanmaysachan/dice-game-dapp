import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import ReactDice from 'react-dice-complete'
import 'react-dice-complete/dist/react-dice-complete.css'
import Alert from 'react-bootstrap/Alert'

export default class Player1 extends Component {
  constructor(props){
    super(props)
    this.state = {
      registered: false,
      playerturn: false,

      secretKey: Math.ceil(Math.random()*100),
      hash: null,
      dieLeft: 5,
      address: null,
      currentTurn: null,

      registerStackId: null,
      rollStackId: null,

      faceDataKey: null,
      betDataKey: null,
      currentTurnDataKey: null,
      fetchableDataKey: null,
      roundWinnerDataKey: null,
      roundLoserDataKey: null,
      fetchRollsDataKey: null,
      
      bet: null,

      alertMessage: "",
      alertVariant: "danger",
      alertShow: false,

      diceVals: []
    }
  }

  registerUser = e => {
    if (e.keyCode === 13) {
      this.registerAddress(e.target.value);
    }
  }

  updateBet = e => {
    this.setState({ bet: e.target.value });
  }

  registerAddress = addr => {

    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    if (addr != drizzleState.accounts[0]){
      alert("supplied address does not match the address on metamask, enter correct public key to register!");
      return;
    }

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["registerPlayer"].cacheSend(1, { from: addr });

    this.setState({ address: addr, registerStackId: stackId });
  }

  getTurn = () => {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    const _currentTurn = contract.methods["currentTurn"].cacheCall();
    this.setState({ currentTurn: _currentTurn });
  }

  getTxStatus = key => {
    const { transactions, transactionStack } = this.props.drizzleState;

    const txHash = transactionStack[this.state[key]];

    if (!txHash) return null;

    return `${transactions[txHash] && transactions[txHash].status}`;
  };

  rollEvent = () => {
    if (isNaN(this.state.bet)) {
      this.setState({ alertMessage: "Enter a number for bet!", alertVariant: "danger", alertShow: true });
      let a = this.state.bet;
      console.log(a);
      return;
    }
    if (this.state.playerturn){
      return;
      this.setState({ alertShow: false })
      this.setState({
        playerturn: false
      });

      const { drizzle, drizzleState } = this.props;
      const contract = drizzle.contracts.MyStringStore;

      let random_num = Math.ceil(Math.random()*100);

      const stackId = contract.methods["roll"].cacheSend(random_num, {
          from: this.state.address
      });

      this.setState({ rollStackId: stackId, secretKey: random_num });
    } else {
      this.setState({ alertMessage: "Not your turn!", alertVariant: "danger", alertShow: true });
    }
  }

  rollDice = () => {

  }

  rollDoneCallback = (num, ind) => {

  }

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to watch the `myString` method
    const _faceDataKey = contract.methods["face"].cacheCall();
    const _betDataKey = contract.methods["bet"].cacheCall();
    const _currentTurnDataKey = contract.methods["currentTurn"].cacheCall();
    const _fetchableDataKey = contract.methods["fetchable"].cacheCall();
    const _roundWinnerDataKey = contract.methods["roundWinner"].cacheCall();
    const _roundLoserDataKey = contract.methods["roundLoser"].cacheCall();
    const _fetchRollsDataKey = contract.methods["revealDie"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      faceDataKey: _faceDataKey,
      betDataKey: _betDataKey,
      currentTurnDataKey: _currentTurnDataKey,
      fetchableDataKey: _fetchableDataKey,
      roundWinnerDataKey: _roundWinnerDataKey,
      roundLoserDataKey: _roundLoserDataKey,
      fetchRollsDataKey: _fetchRollsDataKey
    });
  }

  render() {
    if (this.state.address == null) {
      return (
        <form>
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Enter Public Key for Player 1" onKeyDown={this.registerUser} />
          </div>
        </form>
      );
    }

    const { MyStringStore } = this.props.drizzleState.contracts;

    const face = MyStringStore.face[this.state.faceDataKey];
    const bet = MyStringStore.bet[this.state.betDataKey];
    const currentTurn = MyStringStore.currentTurn[this.state.currentTurnDataKey];
    const fetchable = MyStringStore.fetchable[this.state.fetchableDataKey];
    const fetchDice = MyStringStore.revealDie[this.state.fetchRollsDataKey];

    console.log(face.value);

    if (!this.state.playerturn && currentTurn.value == 1) {
      this.setState({ playerturn: true });
    }

    return (
      <div>
        <Alert variant={this.state.alertVariant} show={this.state.alertShow}>
          {this.state.alertMessage}
        </Alert>
        <ReactDice
          numDice={this.state.dieLeft}
          rollDone={this.rollDoneCallback}
          ref={dice => this.reactDice = dice}
          disableIndividual={true}
        />
        <input type="text" className="form-control" placeholder="Enter your bet" onKeyDown={this.updateBet} />
        <input onClick={this.rollEvent} type="submit" value="Roll!" className="btn-large btn-primary" />
        <input onClick={this.challengeEvent} type="submit" value="Challenge the last player's roll!" className="btn-large btn-primary" />
      </div>
    );
  }
}
