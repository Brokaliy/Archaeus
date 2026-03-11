// Archaeus SDDM Theme
// Coffee shop aesthetic — warm dark, minimal

import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtGraphicalEffects 1.15
import SddmComponents 2.0

Rectangle {
    id: root
    width: Screen.width
    height: Screen.height
    color: "#1C1610"

    // Background wallpaper
    Image {
        id: bg
        anchors.fill: parent
        source: config.background || "background.jpg"
        fillMode: Image.PreserveAspectCrop
        cache: false
        asynchronous: false

        layer.enabled: true
        layer.effect: FastBlur {
            radius: 32
        }
    }

    // Dark overlay
    Rectangle {
        anchors.fill: parent
        color: "#1C1610"
        opacity: 0.6
    }

    // Login card
    Rectangle {
        id: loginCard
        anchors.centerIn: parent
        width: 380
        height: 420
        color: "transparent"

        Column {
            anchors.centerIn: parent
            spacing: 0

            // Logo / title
            Column {
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: 8
                bottomPadding: 40

                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Archaeus"
                    font.family: "Inter"
                    font.pixelSize: 32
                    font.weight: Font.Light
                    font.letterSpacing: 6
                    color: "#E8D5B0"
                }

                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "your system, your way"
                    font.family: "Inter"
                    font.pixelSize: 12
                    font.letterSpacing: 2
                    color: "#7A6A5A"
                }
            }

            // Avatar
            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                width: 72
                height: 72
                radius: 36
                color: "#2E2520"
                border.color: "#C8A96E"
                border.width: 2
                bottomMargin: 24

                Text {
                    anchors.centerIn: parent
                    text: userModel.data(userModel.index(userList.currentIndex, 0), 0x0101).toString().charAt(0).toUpperCase()
                    font.family: "Inter"
                    font.pixelSize: 28
                    font.weight: Font.Light
                    color: "#C8A96E"
                }
            }

            Item { height: 24 }

            // Username display
            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: userModel.data(userModel.index(userList.currentIndex, 0), 0x0101) || "user"
                font.family: "Inter"
                font.pixelSize: 16
                font.weight: Font.Medium
                color: "#E8D5B0"
                bottomPadding: 20
            }

            // Password field
            Rectangle {
                id: passwordField
                anchors.horizontalCenter: parent.horizontalCenter
                width: 280
                height: 44
                radius: 10
                color: "#2E2520"
                border.color: passwordInput.activeFocus ? "#C8A96E" : "#3D2E1E"
                border.width: 1.5

                Behavior on border.color {
                    ColorAnimation { duration: 150 }
                }

                TextInput {
                    id: passwordInput
                    anchors {
                        verticalCenter: parent.verticalCenter
                        left: parent.left
                        right: parent.right
                        margins: 16
                    }
                    echoMode: TextInput.Password
                    passwordCharacter: "●"
                    font.family: "Inter"
                    font.pixelSize: 14
                    color: "#E8D5B0"
                    selectionColor: "#C8A96E"
                    focus: true

                    Keys.onReturnPressed: {
                        sddm.login(userModel.data(userModel.index(userList.currentIndex, 0), 0x0101), passwordInput.text, sessionModel.data(sessionModel.index(sessionList.currentIndex, 0), 0x0100))
                    }

                    Text {
                        anchors.fill: parent
                        text: "password"
                        font: passwordInput.font
                        color: "#5A4A3A"
                        visible: passwordInput.text.length === 0
                    }
                }
            }

            Item { height: 16 }

            // Login button
            Rectangle {
                id: loginBtn
                anchors.horizontalCenter: parent.horizontalCenter
                width: 280
                height: 44
                radius: 10
                color: loginBtnArea.containsMouse ? "#D4B87A" : "#C8A96E"

                Behavior on color {
                    ColorAnimation { duration: 150 }
                }

                Text {
                    anchors.centerIn: parent
                    text: "Sign in"
                    font.family: "Inter"
                    font.pixelSize: 14
                    font.weight: Font.Medium
                    color: "#1C1610"
                }

                MouseArea {
                    id: loginBtnArea
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        sddm.login(userModel.data(userModel.index(userList.currentIndex, 0), 0x0101), passwordInput.text, sessionModel.data(sessionModel.index(sessionList.currentIndex, 0), 0x0100))
                    }
                }
            }

            Item { height: 24 }

            // Error message
            Text {
                id: errorMsg
                anchors.horizontalCenter: parent.horizontalCenter
                text: ""
                font.family: "Inter"
                font.pixelSize: 12
                color: "#C25B4A"
                visible: text.length > 0
            }
        }
    }

    // Session selector (bottom left)
    ComboBox {
        id: sessionList
        anchors {
            bottom: parent.bottom
            left: parent.left
            margins: 24
        }
        width: 160
        height: 32
        model: sessionModel
        currentIndex: sessionModel.lastIndex
        textRole: "name"

        background: Rectangle {
            color: "#2E2520"
            radius: 8
            border.color: "#3D2E1E"
            border.width: 1
        }

        contentItem: Text {
            leftPadding: 10
            text: sessionList.displayText
            font.family: "Inter"
            font.pixelSize: 12
            color: "#9A8A7A"
            verticalAlignment: Text.AlignVCenter
        }
    }

    // User selector (bottom right)
    ComboBox {
        id: userList
        anchors {
            bottom: parent.bottom
            right: parent.right
            margins: 24
        }
        width: 160
        height: 32
        model: userModel
        currentIndex: userModel.lastIndex
        textRole: "name"

        background: Rectangle {
            color: "#2E2520"
            radius: 8
            border.color: "#3D2E1E"
            border.width: 1
        }

        contentItem: Text {
            leftPadding: 10
            text: userList.displayText
            font.family: "Inter"
            font.pixelSize: 12
            color: "#9A8A7A"
            verticalAlignment: Text.AlignVCenter
        }
    }

    // Clock (top right)
    Column {
        anchors {
            top: parent.top
            right: parent.right
            margins: 32
        }
        spacing: 4

        Text {
            anchors.right: parent.right
            text: Qt.formatTime(new Date(), "hh:mm")
            font.family: "Inter"
            font.pixelSize: 48
            font.weight: Font.Light
            color: "#E8D5B0"

            Timer {
                interval: 1000
                repeat: true
                running: true
                onTriggered: parent.text = Qt.formatTime(new Date(), "hh:mm")
            }
        }

        Text {
            anchors.right: parent.right
            text: Qt.formatDate(new Date(), "dddd, MMMM d")
            font.family: "Inter"
            font.pixelSize: 14
            font.weight: Font.Light
            color: "#7A6A5A"

            Timer {
                interval: 60000
                repeat: true
                running: true
                onTriggered: parent.text = Qt.formatDate(new Date(), "dddd, MMMM d")
            }
        }
    }

    Connections {
        target: sddm
        onLoginFailed: {
            errorMsg.text = "Incorrect password"
            passwordInput.text = ""
            passwordInput.focus = true
        }
    }
}
