import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can add auditor as contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const auditor = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-audit",
        "add-auditor",
        [types.principal(auditor.address)],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts[0].result, "(ok true)");
    
    let result = chain.callReadOnlyFn(
      "chain-audit",
      "is-auditor",
      [types.principal(auditor.address)],
      deployer.address
    );
    
    assertEquals(result.result, "(ok true)");
  }
});

Clarinet.test({
  name: "Ensure can record audit event as auditor",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const auditor = accounts.get("wallet_1")!;
    
    // Add auditor first
    chain.mineBlock([
      Tx.contractCall(
        "chain-audit",
        "add-auditor", 
        [types.principal(auditor.address)],
        deployer.address
      )
    ]);
    
    // Record event
    let block = chain.mineBlock([
      Tx.contractCall(
        "chain-audit",
        "record-event",
        [
          types.principal(deployer.address),
          types.ascii("test-function"),
          types.utf8("Test event details")
        ],
        auditor.address
      )
    ]);
    
    assertEquals(block.receipts[0].result, "(ok u0)");
    
    // Verify event count increased
    let count = chain.callReadOnlyFn(
      "chain-audit",
      "get-event-count",
      [],
      deployer.address
    );
    
    assertEquals(count.result, "(ok u1)");
  }
});

Clarinet.test({
  name: "Ensure can get paginated events",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const auditor = accounts.get("wallet_1")!;
    
    // Add auditor and record multiple events
    chain.mineBlock([
      Tx.contractCall(
        "chain-audit",
        "add-auditor",
        [types.principal(auditor.address)],
        deployer.address
      ),
      Tx.contractCall(
        "chain-audit", 
        "record-event",
        [
          types.principal(deployer.address),
          types.ascii("test-1"),
          types.utf8("Test event 1")
        ],
        auditor.address
      ),
      Tx.contractCall(
        "chain-audit",
        "record-event", 
        [
          types.principal(deployer.address),
          types.ascii("test-2"),
          types.utf8("Test event 2")
        ],
        auditor.address
      )
    ]);

    let page = chain.callReadOnlyFn(
      "chain-audit",
      "get-events-page",
      [types.uint(0)],
      deployer.address
    );

    assertEquals(page.result.includes('"total": u2'), true);
    assertEquals(page.result.includes('"page": u0'), true);
  }
});
