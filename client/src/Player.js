import React, {Component} from 'react';
import "bootstrap/dist/css/bootstrap.min.css"
import ReactDice from 'react-dice-complete'
import 'react-dice-complete/dist/react-dice-complete.css'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

export default class Player extends Component {
  constructor(props){
    super(props)
    this.state = {
      playerId: this.props.playerId,
      registered: false,
      playerturn: false,

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
      gameOverDataKey: null,
      livesKey: null,
      challengeStackId: null,
      
      bet: null,

      alertMessage: "",
      alertVariant: "danger",
      alertShow: false,
      rollShow: false,
      challengeShow: false,
      challenger: false,
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
    const stackId = contract.methods["registerPlayer"].cacheSend(this.state.playerId, { from: addr });

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

  isTurn = () => {
    const { MyStringStore } = this.props.drizzleState.contracts;
    const currentTurn = MyStringStore.currentTurn[this.state.currentTurnDataKey];
    return currentTurn.value;
  }

  rollEvent = () => {
    if (this.state.dieLeft == 0) {
      this.setState({ alertMessage: "Game over for you!", alertVariant: "danger", alertShow: true });
      return;
    }
    if (isNaN(this.state.bet) || this.state.bet === null) {
      this.setState({ alertMessage: "Enter a number for bet!", alertVariant: "danger", alertShow: true });
      return;
    }
    const turn = this.isTurn();
    if (turn == this.state.playerId) {
      this.setState({ alertShow: false, rollShow: true });

      const { drizzle, drizzleState } = this.props;
      const contract = drizzle.contracts.MyStringStore;

      let random_num = Math.ceil(Math.random()*100);

      const stackId = contract.methods["roll"].cacheSend(random_num, this.state.bet, {
          from: this.state.address,
          value: 5,
      });

      this.setState({ rollStackId: stackId });
    } else {
      this.setState({ alertMessage: "Not your turn! player " + turn + " playing!", alertVariant: "danger", alertShow: true });
    }
  }

  challengeEvent = () => {
    if (this.state.dieLeft == 0) {
      this.setState({ alertMessage: "Game over for you!", alertVariant: "danger", alertShow: true });
      return;
    }
    const turn = this.isTurn();
    if (turn == this.state.playerId) {
      this.setState({ alertShow: false, challengeShow: true });

      const { drizzle, drizzleState } = this.props;
      const contract = drizzle.contracts.MyStringStore;

      const stackId = contract.methods["callPrev"].cacheSend({ from: this.state.address });

      this.setState({ challengeStackId: stackId, challenger: true });
    } else {
      this.setState({ alertMessage: "Not your turn! player " + turn + " playing!", alertVariant: "danger", alertShow: true });
    }
  }

  fetchDie = () => {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    const _fetch = contract.methods.revealDie().call().then((result) => {
      if (result[0] == 0 && result[1] == 0 && result[2] == 0 && result[3] == 0 && result[4] == 0) {
      } else {
        this.reactDice.rollAll(result);
      }
    }).catch(error => {  });
  }

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to watch the `myString` method
    const _faceDataKey = contract.methods["face"].cacheCall();
    const _betDataKey = contract.methods["bet"].cacheCall();
    const _currentTurnDataKey = contract.methods["currentTurn"].cacheCall();
    const _fetchableDataKey = contract.methods["fetchable"].cacheCall();
    const _gameOver = contract.methods["gameOver"].cacheCall();
    const _roundWinnerDataKey = contract.methods["roundWinner"].cacheCall();
    const _roundLoserDataKey = contract.methods["roundLoser"].cacheCall();
    const _livesKey = contract.methods["lives"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({
      faceDataKey: _faceDataKey,
      betDataKey: _betDataKey,
      currentTurnDataKey: _currentTurnDataKey,
      fetchableDataKey: _fetchableDataKey,
      roundWinnerDataKey: _roundWinnerDataKey,
      roundLoserDataKey: _roundLoserDataKey,
      gameOverDataKey: _gameOver,
      livesKey: _livesKey
    });
  }

  render() {
    if (this.state.address == null) {
      return (
        <form>
          <div className="form-group">
            <input type="text" className="form-control" placeholder={"Enter Public Key for Player " + this.state.playerId} onKeyDown={this.registerUser} />
          </div>
        </form>
      );
    }

    const { MyStringStore } = this.props.drizzleState.contracts;

    const face = MyStringStore.face[this.state.faceDataKey];
    const bet = MyStringStore.bet[this.state.betDataKey];
    const fetchable = MyStringStore.fetchable[this.state.fetchableDataKey];
    const roundWinner = MyStringStore.roundWinner[this.state.roundWinnerDataKey];
    const roundLoser = MyStringStore.roundLoser[this.state.roundLoserDataKey];
    const gameOver = MyStringStore.gameOver[this.state.gameOverDataKey];
    const lives = MyStringStore.lives[this.state.livesKey];

    console.log(fetchable.value);
    if (fetchable.value == true) {
      this.fetchDie();
    }

    if (lives.value[this.state.playerId - 1] == 0 || gameOver.value == true) {
      return(
        <div>
          <Alert variant="success" show={true}>
            Game over! Thank you for playing!
          </Alert>
        </div>
      )
    }

    return (
      <div>
        <Alert variant={this.state.alertVariant} show={this.state.alertShow}>
          {this.state.alertMessage}
        </Alert>
        <div>
          <h3><Badge variant="success">Face: {face.value}</Badge></h3>
          <h3><Badge variant="danger">Bet: {bet.value}</Badge></h3>
          <h3><Badge variant="info">Last Round Winner: {roundWinner.value != 0 ? roundWinner.value : "No winner yet"}</Badge></h3>
          <h3><Badge variant="info">Last Round Loser: {roundLoser.value != 0 ? roundLoser.value : "No loser yet"}</Badge></h3>
          <h3><Badge variant="danger">Lives Left: {lives.value[this.state.playerId - 1]}</Badge></h3>
        </div>
        <h4> Previous Roll: </h4>
        <ReactDice
          numDice={5}
          ref={dice => this.reactDice = dice}
          disableIndividual={true}
        />
        <input type="text" className="form-control" placeholder="Enter your bet (minimum transaction 5 wei per bet, bet must be bigger than previous!)" onChange={this.updateBet} /> <br/>
        <Button onClick={this.rollEvent} variant="primary">Roll</Button> 
        <h5>OR!</h5>
        <Button onClick={this.challengeEvent} variant="warning">Challenge</Button> 
        <br/> <br/>
        <Alert variant="info" show={this.state.rollShow}> Roll transaction status: {this.getTxStatus("rollStackId")} </Alert>
        <Alert variant="info" show={this.state.challengeShow}> Challenge transaction status: {this.getTxStatus("challengeStackId")} </Alert>
      </div>
    );
  }
}
