import Input from './input';
import Score from './score';
import { AnimatedSprite } from 'pixi.js-legacy';

const AllJudgeTimes = {
    bad     : 200,
    good    : 160,
    perfect : 80,

    badChallenge     : 100,
    goodChallenge    : 75,
    perfectChallenge : 40
};

export default class Judgement
{
    constructor(params)
    {
        this.chart    = params.chart;
        this.stage    = params.stage;
        this.autoPlay = params.autoPlay ? !!params.autoPlay : false;
        this.texture  = params.texture;
        this.sounds   = params.sounds;

        if (!params.stage) throw new Error('You cannot do judgement without a stage');
        if (!params.chart) throw new Error('You cannot do judgement without a chart');

        this._autoPlay      = params.autoPlay ? !!params.autoPlay : false;
        this._challengeMode = params.challangeMode ? !!params.challangeMode : false;

        this.score       = new Score(this.chart.totalRealNotes, !!params.challangeMode, !!params.autoPlay);
        this.input       = new Input({ canvas: params.canvas });
        this.judgePoints = [];

        /* ===== 判定用时间计算 ===== */
        this.judgeTimes = {
            perfect : (!this._challengeMode ? AllJudgeTimes.perfect : AllJudgeTimes.perfectChallenge) / 1000,
            good    : (!this._challengeMode ? AllJudgeTimes.good : AllJudgeTimes.goodChallenge) / 1000,
            bad     : (!this._challengeMode ? AllJudgeTimes.bad : AllJudgeTimes.badChallenge) / 1000
        };

        /* ===== 分数计算模块 ===== */
        /*
        this.score = {
            scorePerNote  : !this._challengeMode ? 900000 / this.chart.totalRealNotes : 1000000 / this.chart.totalRealNotes,
            scorePerCombo : !this._challengeMode ? 100000 / this.chart.totalRealNotes : 0,

            score    : 0,
            acc      : 0,
            combo    : 0,
            maxCombo : 0,

            perfect  : 0,
            good     : 0,
            bad      : 0,
            miss     : 0
        };
        */
        
        this.calcTick = this.calcTick.bind(this);
        this.calcNote = calcNoteJudge.bind(this);
    }

    createSprites(showInputPoint = true)
    {
        this.score.createSprites(this.stage);
        this.input.createSprite(this.stage);
        // this.stage.addChild(this.input.sprite);
    }

    resizeSprites(size)
    {
        this.score.resizeSprites(size);
        this.input.resizeSprites(size);
    }

    calcTick()
    {
        this.judgePoints.length = 0;
        this.input.calcTick();
    }

    /*
    calcNote(currentTime, note)
    {
        if (note.isScored) return;
        if (note.type !== 3 && note.time + this.judgeTimes.bad < currentTime)
        {
            note.isScored = true;
            note.sprite.visible = false;
            return;
        }

        let timeBetween = note.time - currentTime,
            timeBetweenReal = timeBetween > 0 ? timeBetween : timeBetween * -1,
            notePosition = { x: note.sprite.judgelineX, y: note.sprite.judgelineY },
            judgeline = note.judgeline;

        if (note.type !== 3 && timeBetween <= 0 && timeBetweenReal <= this.judgeTimes.bad && !note.isScored)
        {
            note.sprite.alpha = 1 + (timeBetween / this.judgeTimes.bad);
        }

        switch (note.type)
        {
            case 1:
            {
                this.judgePoints.forEach((judgePoint, judgePointIndex) =>
                {
                    if (
                        judgePoint.type === 1 &&
                        judgePoint.isInArea(notePosition.x, notePosition.y, judgeline.cosr, judgeline.sinr, this.renderSize.noteWidth) &&
                        !note.isScored
                    ) {
                        if  (timeBetweenReal <= this.judgeTimes.perfect)
                        {
                            note.isScored = true;
                        }
                        else if (timeBetweenReal <= this.judgeTimes.good)
                        {
                            note.isScored = true;
                        }
                        else if (timeBetweenReal <= this.judgeTimes.bad)
                        {
                            note.isScored = true;
                        }
                    }

                    if (note.isScored)
                    {
                        note.sprite.alpha = 0;
                        createClickAnimate(this.stage, this.texture, notePosition.x, notePosition.y, this.renderSize.noteScale);
                        this.judgePoints.splice(judgePointIndex, 1);
                    }
                });
                break;
            }
        }
    }
    */

    pushScore(type = 0)
    {

    }
}

/*
class Input
{
    constructor(params)
    {
        this.x = Number(params.x);
        this.y = Number(params.y);
        this.isMoving = false;
        this.time = 0;
        this.type = params.type ? params.type : 1;
    }

    move(params)
    {
        this.x = Number(params.x);
        this.y = Number(params.y);
        this.isMoving = true;
        this.time = 0;
    }

    calcTick()
    {
        this.time++;
    }
}

class JudgePoint
{
    constructor(x, y, type = 0)
    {
        this.x = Number(x);
        this.y = Number(y);
        this.type = Number(type);
    }

    isInArea(x, y, cosr, sinr, hw)
    {
        return Math.abs((this.x - x) * cosr + (this.y - y) * sinr) <= hw;
    }
}
*/

function calcNoteJudge(currentTime, note)
{
    if (note.isFake) return; // 忽略假 Note
    if (note.isScored) return; // 已记分忽略
    if (note.time - this.judgeTimes.bad > currentTime) return; // 不在记分范围内忽略
    if (note.type !== 3 && note.time + this.judgeTimes.bad < currentTime)
    {
        note.isScored = true;
        note.sprite.alpha = 0;
        return;
    }

    let timeBetween = note.time - currentTime,
        timeBetweenReal = timeBetween > 0 ? timeBetween : timeBetween * -1;
    
    if (note.type !== 3 && note.time <= currentTime)
    {
        note.sprite.alpha = 1 + (timeBetween / this.judgeTimes.bad);
    }

    switch (note.type)
    {
        case 1:
        {
            /*
            if (timeBetweenReal <= this.judgeTimes.bad)
            {
                note.isScored = true;
                note.scoreTime = timeBetween;

                if (timeBetweenReal <= this.judgeTimes.perfect) note.score = 4;
                else if (timeBetweenReal <= this.judgeTimes.good) note.score = 3;
                else note.score = 2;
            }

            if (note.isScored)
            {
                note.sprite.alpha = 0;
            }
            */
            break;
        }
        case 2:
        {
            break;
        }
        case 3:
        {
            break;
        }
        case 4:
        {
            break;
        }
    }
}

function createClickAnimate(stage, texture, x, y, scale, color)
{
    let sprite = new AnimatedSprite(texture);

    sprite.anchor.set(0.5);
    sprite.position.x = x;
    sprite.position.y = y;
    sprite.scale.set(2);

    sprite.loop = false;

    sprite.onFrameChange = function () {
        this.alpha = 1 - (this.currentFrame / this.totalFrames);
    };
    sprite.onComplete = function () {
        this.destroy();
    };

    stage.addChild(sprite);
    sprite.play();

    return sprite;
}