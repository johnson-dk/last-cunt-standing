export default function Help() {
  return (
    <div className="page help-page">

      <div className="card">
        <h2 className="help-section-title">Standings</h2>
        <p>Shows all players in the current competition ranked by weeks survived. A player's weeks survived count only increases on a <strong>win</strong> or <strong>void</strong> result — a pick with no result yet doesn't count. Eliminated players appear at the bottom with the week they went out.</p>
      </div>

      <div className="card">
        <h2 className="help-section-title">Players</h2>
        <p>Add, rename, or remove participants. Setting a player's status to <em>eliminated</em> manually removes them from the active Picks table. Players carry their pick history into a new competition (minus the eliminated flag — everyone starts fresh).</p>
      </div>

      <div className="card">
        <h2 className="help-section-title">Picks</h2>
        <p>The main weekly entry screen. Each active player selects one Premier League team per gameweek. Teams already used by that player in a previous week are shown as <em>(used)</em> and cannot be selected again.</p>
        <ul className="help-list">
          <li><strong>Gameweek selector</strong> — arrows or the number dropdown navigate between weeks. The app auto-loads the current FPL gameweek on first visit.</li>
          <li><strong>Deadline banner</strong> — shows when picks must be submitted by. Turns amber inside 24 hours, red inside 1 hour. Shows "Open for picks" if the deadline hasn't been published yet.</li>
          <li><strong>Process Results</strong> — fetches live fixture results from the FPL API and applies win/loss/void to each pick. The button is disabled for future weeks or weeks already processed.</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="help-section-title">Results</h2>
        <p>Shows all fixtures for a selected gameweek with scores. Where a player picked a team, their name appears under that team's fixture card alongside the result badge. Useful for a post-gameweek review.</p>
      </div>

      <div className="card">
        <h2 className="help-section-title">History</h2>
        <p>A grid of every player against every gameweek played. Each cell shows the team picked and the result badge (or a dash if no pick was made). Columns extend to at least the current gameweek so the full table is always visible.</p>
      </div>

      <div className="card">
        <h2 className="help-section-title">Archive</h2>
        <p>Lists all past and current competitions. Click a competition to expand a read-only standings table showing final player positions. Useful for reviewing previous seasons.</p>
      </div>

      <div className="card">
        <h2 className="help-section-title">Settings</h2>
        <ul className="help-list">
          <li><strong>Pool name</strong> — the title shown in the header.</li>
          <li><strong>Entry fee</strong> — stored for reference, not calculated automatically.</li>
          <li><strong>Prize structure</strong> — add payout tiers (1st, 2nd, etc.) with amounts.</li>
          <li><strong>Draw rule</strong> — controls what happens when a player's picked team draws:
            <ul className="help-list help-list--nested">
              <li><em>Survive</em> — draw counts as a void (player stays in, week counts toward survived total).</li>
              <li><em>Loss</em> — draw is treated as a loss and the player is eliminated.</li>
              <li><em>Re-pick</em> — the pick is removed so the player can choose a different team for that week.</li>
            </ul>
          </li>
          <li><strong>New Competition</strong> — starts a fresh competition from a chosen gameweek. All players are reset to active; their used-teams history is cleared. The old competition moves to Archive.</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="help-section-title">Key concepts</h2>
        <ul className="help-list">
          <li><strong>Void</strong> — a result that keeps a player in the pool without consuming their pick. Happens on a draw when the draw rule is set to "Survive".</li>
          <li><strong>Weeks survived</strong> — counts only gameweeks where the player's pick returned a win or void. Pending picks (no result yet) and losses do not count.</li>
          <li><strong>Used teams</strong> — once a player picks a team in any gameweek, they cannot pick that same team again for the rest of the competition. The used-teams set resets when a new competition starts.</li>
          <li><strong>Gameweek lifecycle</strong> — picks open when the previous gameweek closes. The FPL deadline is fetched live from the API; processing results is only possible once the gameweek has kicked off.</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="help-section-title">FAQ</h2>
        <dl className="help-faq">
          <dt>What happens if I process results before all fixtures have finished?</dt>
          <dd>Only completed fixtures return a win/loss/draw. Picks for teams in unfinished games will have no result applied — you can re-process the week once all matches are done (results already set are overwritten).</dd>

          <dt>Can I undo a processed week?</dt>
          <dd>Not automatically. You'd need to remove the picks manually on the Players page or wait — re-processing the same week after all fixtures finish will overwrite the results.</dd>

          <dt>What does "Already processed" mean on the Process Results button?</dt>
          <dd>At least one pick for that gameweek already has a result. The button is disabled to prevent accidental double-processing. Navigate away and back to re-enable if you need to re-process.</dd>

          <dt>Why is "Process Results" greyed out for a future week?</dt>
          <dd>The app detects that the selected gameweek is beyond the current FPL gameweek and prevents processing fixtures that haven't been played yet.</dd>

          <dt>How do I start a new season mid-season?</dt>
          <dd>Go to Settings → New Competition. Enter a name and the gameweek to start from. All players reset to active with empty pick histories. The current competition is archived automatically.</dd>

          <dt>Where is data stored?</dt>
          <dd>If you signed in with Google, data is stored in Firebase Firestore and syncs across devices. In local mode, data is saved to your browser's local storage and stays on this device only.</dd>
        </dl>
      </div>

    </div>
  )
}
