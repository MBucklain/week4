import detectEthereumProvider from "@metamask/detect-provider"
import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols"
import { providers ,Contract} from "ethers"
import Head from "next/head"
import React from "react"
import styles from "../styles/Home.module.css"
import { useForm} from "react-hook-form"
import { object, string, number, date } from 'yup';
import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json"


export default function Home() {
    const [logs, setLogs] = React.useState("Connect your wallet and greet!")
    const [logs1, setLogs1] = React.useState("Response event")
    let userSchema = object({
        Name: string().required(),
        Age: number().required().positive().integer(),
        address: string().required(),
        createdOn: date().default(() => new Date()),
      });

     

      

    async function greet() {
        setLogs("Creating your Semaphore identity...")
//
        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner()
        const message = await signer.signMessage("Sign this message to create your identity!")

        const identity = new ZkIdentity(Strategy.MESSAGE, message)
        const identityCommitment = identity.genIdentityCommitment()
        const identityCommitments = await (await fetch("./identityCommitments.json")).json()

        const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, identityCommitment)

        setLogs("Creating your Semaphore proof...")

        const greeting = "Hello world"

        const witness = Semaphore.genWitness(
            identity.getTrapdoor(),
            identity.getNullifier(),
            merkleProof,
            merkleProof.root,
            greeting
        )

        const { proof, publicSignals } = await Semaphore.genProof(witness, "./semaphore.wasm", "./semaphore_final.zkey")
        const solidityProof = Semaphore.packToSolidityProof(proof)
            


        const contract = new Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", Greeter.abi)
        const provider1 = new providers.JsonRpcProvider("http://localhost:8545")
        const contractOwner = contract.connect(provider1.getSigner())
        console.log("Hi there2")
        contractOwner.on("NewGreeting", temp => console.log(`test: ${temp}`))
       

        console.log("Hi there1")
        const response = await fetch("/api/greet", {
            method: "POST",
            body: JSON.stringify({
                greeting,
                nullifierHash: publicSignals.nullifierHash,
                solidityProof: solidityProof
            })
        })

        if (response.status === 500) {
            const errorMessage = await response.text()

            setLogs(errorMessage)
        } else {
            
            const message = await response.text()
            console.log("response.text()");
            alert(JSON.parse(message)["greet"])
            setLogs1(`NewGreeting :${JSON.parse(message)["greet"]}`)
            console.log(message);
            console.log("response.text()");
            setLogs("Your anonymous greeting is onchain :)")
        }
        
        
    }
    const{
        register,
         handleSubmit,
        // watch,
         
     } = useForm({
         defaultValues: {
             Name: "",
             Age: "",
             address: ""
         }
     });

    return (

        
        <div className={styles.container}>
            <Head>
                <title>Greetings</title>
                <meta name="description" content="A simple Next.js/Hardhat privacy application with Semaphore." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
               

                <h1 className={styles.title}>Greetings</h1>

                <p className={styles.description}>A simple Next.js/Hardhat privacy application with Semaphore.</p>

                <div className={styles.logs}>{logs}</div>

                <div className={styles.logs}>{logs1}</div>
                
                
                
                
                
                
                
                <form className={styles.form} onSubmit={handleSubmit((data)=>{
                   let temp = JSON.stringify(data);
                   console.log(temp);
                    console.log(userSchema.validate(temp));
                    greet();
               }

                )}>

                   <label>Name</label>
                   <input {...register("Name")} defaultValue = "Name"/>
                   <label>Age</label>
                   <input {...register("Age")} defaultValue = "Age"/>
                   <label>address</label>
                   <input {...register("address")} defaultValue = "address"/>
                   <input type="submit" />


               </form>

                {/* <div onClick={() => greet()} className={styles.button}>
                    Greet
                </div> */}
            </main>
        </div>
    )
}
