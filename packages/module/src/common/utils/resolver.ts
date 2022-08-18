import { AssetFingerprint, csl } from '@mesh/core';
import {
  fromBytes, toAddress, toBaseAddress,
  toBytes, toEnterpriseAddress, toPlutusData,
} from './converter';
import { deserializeAddress } from './deserializer';
import type { Data } from '@mesh/common/types';

export const resolveAddressKeyHash = (bech32: string) => {
  try {
    const baseAddress = toBaseAddress(bech32);
    const keyHash = baseAddress?.payment_cred().to_keyhash();

    if (keyHash !== undefined)
      return fromBytes(keyHash.to_bytes());

    throw new Error(`Couldn't resolve key hash from address: ${bech32}.`);
  } catch (error) {
    throw error;
  }
};

export const resolveDataHash = (data: Data) => {
  const plutusData = toPlutusData(data);
  const dataHash = csl.hash_plutus_data(plutusData);
  return fromBytes(dataHash.to_bytes());
};

export const resolveFingerprint = (policyId: string, assetName: string) => {
  return AssetFingerprint.fromParts(
    toBytes(policyId),
    toBytes(assetName)
  ).fingerprint();
};

export const resolveScriptHash = (bech32: string) => {
  try {
    const enterpriseAddress = toEnterpriseAddress(bech32);
    const scriptHash = enterpriseAddress?.payment_cred().to_scripthash();

    if (scriptHash !== undefined)
      return fromBytes(scriptHash.to_bytes());

    throw new Error(`Couldn't resolve script hash from address: ${bech32}.`);
  } catch (error) {
    throw error;
  }
};

export const resolveStakeKey = (bech32: string) => {
  try {
    const address = toAddress(bech32);
    const cborAddress = fromBytes(address.to_bytes());
    const cborStakeAddress = `e${address.network_id()}${cborAddress.slice(58)}`;

    return deserializeAddress(cborStakeAddress).to_bech32();
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't resolve stake key from address: ${bech32}.`);
  }
};