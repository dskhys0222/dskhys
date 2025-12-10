# GitHub Actions Secrets Configuration

This document lists all the secrets that need to be configured in GitHub repository settings for the CI/CD pipeline to work.

## Setting up Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

## Required Secrets

### SSH_PRIVATE_KEY

**Description:** SSH private key for connecting to the deployment server

**How to generate:**

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

Then copy the content of the private key:

```bash
cat ~/.ssh/github_deploy
```

Paste the entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) as the secret value.

**Important:** Also add the public key to the server:

```bash
cat ~/.ssh/github_deploy.pub
# Copy this and add it to ~/.ssh/authorized_keys on your deployment server
```

### SSH_HOST

**Description:** The hostname or IP address of your deployment server

**Example values:**

- `example.com`
- `192.168.1.100`
- `deploy.myapp.com`

### SSH_USER

**Description:** The username to use for SSH connection

**Example values:**

- `ubuntu`
- `deploy`
- `myuser`

### SSH_PORT

**Description:** The SSH port number (optional, defaults to 22)

**Example values:**

- `22` (default)
- `2222`
- `22000`

### DEPLOY_PATH

**Description:** The absolute path on the server where the application will be deployed

**Example values:**

- `/opt/dskhys`
- `/home/deploy/packages/dskhys`
- `/var/www/dskhys`

**Note:** This directory should exist on the server and be writable by the SSH user.

## Verification

After configuring all secrets, you can verify them by:

1. Going to the **Actions** tab in your repository
2. Selecting the **Deploy to Server** workflow
3. Clicking **Run workflow** to trigger a manual deployment
4. Watching the workflow run to ensure all secrets are correctly configured

## Security Notes

- Never commit secrets to your repository
- Rotate SSH keys regularly
- Use dedicated deployment users with minimal permissions
- Regularly audit access to your deployment server
- Consider using SSH key passphrases for additional security
