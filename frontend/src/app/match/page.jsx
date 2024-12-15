'use client'
import styles from './mystyles.module.css'


export default function OtherPage() {

      //test data to make a bracket
      const testPlayer = [
        {"firstname":"Jeff", "lastName":"Jefferson"},
        {"firstname":"Fred", "lastName":"Fredrickson"},
        {"firstname":"Bob", "lastName":"Robertson"},
        {"firstname":"Dang", "lastName":"Knabit"},
      ];

      //make a pairs of players
      function makePairs(playersList){
        let pairs = [];

        for(let i =0; i < playersList.length; i+=2)
        {
          pairs[pairs.length] = playersList[i] + playersList[i+1];
        }

        return pairs;
      }

      console.log(makePairs(testPlayer));

    return (<div className={styles.matchScreen}>
        <div className={styles.matchScreenChild}></div>
        <div className={styles.matchScreenItem}/>
        <div className= {styles.matches}>Matches</div>
        <div className={styles.table6Card}>
          <div className={styles.table6}>Table 6</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className={styles.table5Card}>
          <div className={styles.table5}>Table 5</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className={styles.table4Card}>
          <div className={styles.table4}>Table 4</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className={styles.table3Card}>
          <div className={styles.table3}>Table 3</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className={styles.table2Card}>
          <div className={styles.table2}>Table 2</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className={styles.table1Card}>
          <div className={styles.table1}>Table 1</div>
          <div className={styles.tableCardChild}></div>
          <div className={styles.tableCardItem}></div>
          <div className={styles.player1}>PLAYER 1</div>
          <div className={styles.player2}>PLAYER 2</div>
        </div>
        <div className="match-1">Match 1</div>
        <div className="event-name">EVENT NAME</div>
      </div>)

    // return(<div>Deep and wretched hater.</div>)
}

