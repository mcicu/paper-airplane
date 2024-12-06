"use client";

import UserDetails from "@/components/UserDetails";
import React, {useEffect, useState} from "react";
import TelegramUser from "@/models/TelegramUser";
import {cloudStorage, init, retrieveLaunchParams} from "@telegram-apps/sdk";
import GameCanvas from "@/components/GameCanvas";

function MainComponent() {
    // User info from Telegram
    const [user, setUser] = useState<TelegramUser>({id: -1, name: "Undefined", photoUrl: ""});
    const [highestUserScore, setHighestUserScore] = useState(0);

    const saveHighScore = async (score: number) => {
        await cloudStorage.setItem("high_score", score.toString());
    }

    const getHighScore = async () => {
        return cloudStorage.getItem("high_score")
            .then(Number.parseInt, () => 0);
    }

    const handleScoreUpdate = function (score: number) {
        if (score > highestUserScore) {
            setHighestUserScore(score);
            saveHighScore(score).then();
        }
    }

    // Telegram Web Apps API Initialization
    useEffect(() => {
        init();

        getHighScore()
            .then(setHighestUserScore);

        const launchParams = retrieveLaunchParams();
        const userInfo = launchParams.initData?.user;

        if (userInfo) {
            setUser({
                id: userInfo.id,
                name: `${userInfo.firstName} ${userInfo.lastName || ""}`.trim(),
                photoUrl: userInfo.photoUrl
            });
        }
    }, []);


    return (
        <div className="flex flex-col w-full h-full">
            <div className="h-10 align-middle">{user && <UserDetails user={user}></UserDetails>}</div>
            <div>High score: {highestUserScore}</div>
            <div className="flex-1 overflow-auto">
                <GameCanvas handleScoreUpdate={handleScoreUpdate}></GameCanvas>
            </div>
        </div>
    );
}

export default MainComponent;