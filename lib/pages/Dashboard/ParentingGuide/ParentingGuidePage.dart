import 'package:acadamicConnect/Components/AnnouncementCard.dart';
import 'package:acadamicConnect/Components/TopBar.dart';
import 'package:acadamicConnect/Models/Announcement.dart';
import 'package:acadamicConnect/Utility/Resources.dart';
import 'package:acadamicConnect/Utility/constants.dart';
import 'package:flutter/material.dart';

class ParentingGuidePage extends StatefulWidget {
  ParentingGuidePage({Key key}) : super(key: key);

  _ParentingGuidePageState createState() => _ParentingGuidePageState();
}

class _ParentingGuidePageState extends State<ParentingGuidePage> {
  String randomText =
      '''When using any kind of state management strategy how should I handle exceptions?
I’m confused if they’re business logic or UI logic.
For example:
I want to perform login and call a function for that, this function can either return a token or raise an exception, depending on the case my UI will display different information. Should I handle the exception in my business logic and convert it to a state or should I handle it in the UI?''';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: TopBar(
        child: kBackBtn,
        onPressed: () {
          kbackBtn(context);
        },
        title: string.parenting_guide,
      ),
      body: Center(
        child: Container(
          constraints: BoxConstraints(
            maxWidth: 700,
          ),
          child: ListView.builder(
            itemCount: 5,
            itemBuilder: (context, index) => new AnnouncementCard(
                  announcement: Announcement(
                    by: 'userid',
                    caption: randomText + randomText + randomText,
                    forClass: '10A',
                    id: 'postid' + index.toString(),
                    photoUrl:
                        "https://cyprus-mail.com/wp-content/uploads/2013/06/schoolchildren06.jpg",
                    timestamp: 'Jan 21, 10:30 AM',
                  ),
                ),
          ),
        ),
      ),
    );
  }
}
