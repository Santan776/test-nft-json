import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log(`User loaded: ${user.publicKey.toBase58()}`)

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Umi user was set");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "SadCats",
    symbol: "SC",
    uri: "https://raw.githubusercontent.com/Santan776/test-nft-json/refs/heads/master/meta.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true
});
await transaction.sendAndConfirm(umi);

const createdCollection = await fetchDigitalAsset(umi, collectionMint.publicKey);
console.log(`Collection: ${createdCollection}, 
    link: ${getExplorerLink("address", 
        createdCollection.mint.publicKey, 
        "devnet")}`
);