def call(buildStatus) {
    def environment = env.BRANCH_NAME == 'main' ? 'PRODUCTION' : 'DEVELOPMENT'
    def trivySummary = getTrivySummary()

    slackSend(
        channel: '#jenkins-ci',
        attachments: [
            [
                color: buildStatus == 'SUCCESS' ? 'good' : 'danger',
                title: "${env.JOB_NAME} #${env.BUILD_NUMBER}",
                title_link: env.BUILD_URL,
                text: '*Trivy Summary:*\n```' + trivySummary + '```',
                fields: [
                    [title: 'Status', value: buildStatus, short: true],
                    [title: 'Branch', value: env.BRANCH_NAME, short: true],
                    [title: 'Environment', value: environment, short: true],
                    [title: 'Docker', value: env.IMAGE_TAGGED ?: 'N/A', short: false]
                ]
            ]
        ]
    )
}

def getTrivySummary() {
    return sh(
        script: """
            if [ -f trivyfs.json ]; then
                jq '[.Results[].Vulnerabilities[]?.Severity]
                    | group_by(.)
                    | map({(.[0]): length})
                    | add' trivyfs.json
            else
                echo "No report"
            fi
        """,
        returnStdout: true
    ).trim()
}

return this
