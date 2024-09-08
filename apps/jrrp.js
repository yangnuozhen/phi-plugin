import plugin from '../../../lib/plugins/plugin.js'
import Config from '../components/Config.js'
import path from 'path'
import { infoPath } from '../model/path.js'
import { redisPath } from '../model/constNum.js'
import readFile from '../model/getFile.js'
import atlas from '../model/picmodle.js'
import getInfo from '../model/getInfo.js'
import fCompute from '../model/fCompute.js'
import send from '../model/send.js'

/**一言 */
let sentence = await readFile.FileReader(path.join(infoPath, 'sentences.json'))


export class phihelp extends plugin {
    constructor() {
        super({
            name: 'phi-help',
            dsc: 'phigros屁股肉帮助',
            event: 'message',
            priority: 1000,
            rule: [
                {
                    reg: `^[#/](${Config.getUserCfg('config', 'cmdhead')})(\\s*)(jrrp|今日人品)$`,
                    fnc: 'jrrp'
                }

            ]
        })

    }

    async jrrp(e) {
        let jrrp = await redis.get(`${redisPath}:jrrp:${e.user_id}`)
        if (!jrrp) {
            jrrp = [Math.round(easeOutCubic(Math.random()) * 100), Math.floor(Math.random() * sentence.length)]
            let good = [...getInfo.word.good]
            let bad = [...getInfo.word.bad]
            let common = [...getInfo.word.common]
            for (let i = 0; i < 4; i++) {
                let id = Math.floor(Math.random() * (good.length + common.length))
                if (id < good.length) {
                    jrrp.push(good[id])
                    good.splice(id, 1)
                } else {
                    jrrp.push(common[id - good.length])
                    common.splice(id - good.length, 1)
                }
            }
            for (let i = 0; i < 4; i++) {
                let id = Math.floor(Math.random() * (bad.length + common.length))
                if (id < bad.length) {
                    jrrp.push(bad[id])
                    bad.splice(id, 1)
                } else {
                    jrrp.push(common[id - bad.length])
                    common.splice(id - bad.length, 1)
                }
            }
            /**有效期到第二天凌晨0点 */
            redis.set(`${redisPath}:jrrp:${e.user_id}`, JSON.stringify(jrrp), { PX: 86400000 - (new Date() % 86400000)})
        } else {
            jrrp = JSON.parse(jrrp)
        }
        let data = {
            bkg: getInfo.getill("Shine After"),
            lucky: jrrp[0],
            luckRank: jrrp[1] == 100 ? 5 : (jrrp[1] >= 80 ? 4 : (jrrp[1] >= 60 ? 3 : (jrrp[1] >= 40 ? 2 : (jrrp[1] >= 20 ? 1 : 0)))),
            year: new Date().getFullYear(),
            month: fCompute.ped(new Date().getMonth() + 1, 2),
            day: fCompute.ped(new Date().getDate(), 2),
            sentence: sentence[jrrp[1]],
            good: jrrp.slice(2, 6),
            bad: jrrp.slice(6, 10),
        }
        send.send_with_At(e, await atlas.common(e, 'jrrp', data))
    }

}

/**
 * 
 * @param {number} x 
 * @returns {number}
 */
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}
