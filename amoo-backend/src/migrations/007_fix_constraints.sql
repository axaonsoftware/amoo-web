-- H10: Prevent wallet balance from going negative
ALTER TABLE wallets
  ADD CONSTRAINT chk_wallet_balance_non_negative
  CHECK (balance >= 0);

-- H11: Preserve chat history when an expert is deleted (SET NULL instead of CASCADE)
-- PostgreSQL requires dropping and re-adding the FK to change its ON DELETE action.
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_expert_id_fkey;
ALTER TABLE conversations
  ADD CONSTRAINT conversations_expert_id_fkey
  FOREIGN KEY (expert_id) REFERENCES experts(id)
  ON DELETE SET NULL;
