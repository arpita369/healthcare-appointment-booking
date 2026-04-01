package com.cts.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Example {
	public static void main(String[] args) {
		ArrayList<Integer> arr = new ArrayList<>(Arrays.asList(1,2,10,3,4,5,9,6,7,8,90));
//		ArrayList<Integer> li = Arrays.asList(1,2,10,3,4,5,9,6,7,8,90);
		
		List<Integer> odd = new ArrayList<Integer>();
		List<Integer> even = new ArrayList<Integer>();
		for (Integer number: arr) {
			if (number%2==0) {
				even.add(number);
			}else {
				odd.add(number);
			}
		}
		
		System.out.println("Even number:" + even);
		System.out.println("Odd number:" + odd);
	}
}
