# Backup, restore and rollback

Use Supabase managed database backups/PITR appropriate to the business's recovery objectives, and separately back up every private Storage object with its path/checksum. A database backup does not automatically contain the Storage file bytes. Back up configuration and original brand/font assets separately; keep credentials in a secret manager, not source archives.

For a restore drill, create an isolated Supabase project with email/jobs disabled, restore database data/schema using the provider-supported method, restore Storage objects into the private documents bucket, then verify document_files checksums and signed download access. Check invoice/payment totals and audit history, bootstrap only the test administrator, and exercise the mandatory financial examples. Record achieved RPO/RTO. No restore has been executed in this environment.

Before a migration, record the current application deployment and schema version, retain a tested backup and review backward compatibility. Prefer additive schema changes so the previous application deployment can be rolled back safely. Redeploy the previous Vercel version if necessary; never assume application rollback undoes a destructive migration. Use a reviewed forward repair or restore into a new project and planned cutover. Keep jobs disabled during recovery to avoid duplicate sends.

Restrict backup access to administrators, encrypt exports, define retention and test restores periodically. Monitor failed PDFs, failed jobs, provider rejections and unusual authorization failures without logging secrets or full client document content.
